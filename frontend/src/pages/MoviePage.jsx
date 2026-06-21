import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovies, getMovie } from '../api/client';

/** 電影詳情 + 電影列表頁。版面移植自 design/movieinfo_neon.html。 */
export default function MoviePage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    getMovies().then(list => {
      setMovies(list);
      if (!movieId && list.length > 0) setHero(list[0]);
    });
    if (movieId) getMovie(movieId).then(setHero);
  }, [movieId]);

  // WebGL shader — 與 design/movieinfo_neon.html 完全相同；hero 載入後 canvas 才在 DOM，需依賴 hero
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    const sync = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx); vec2 i1;
  i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 a0=x-floor(x+0.5);
  vec3 m0=m*(1.79284291400159-0.85373472095314*(a0*a0+h*h));
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m0,g);
}
void main(){
  vec2 uv=v_texCoord; vec2 p=uv*2.0-1.0;
  p.x*=u_resolution.x/u_resolution.y;
  float cycle=mod(u_time*0.4,6.0);
  float explode=smoothstep(2.0,4.0,cycle)*(1.0-smoothstep(4.5,5.5,cycle));
  float n=snoise(p*(0.8+explode*2.0)+u_time*0.2);
  float n2=snoise(p*2.0-u_time*0.3);
  float radius=0.5+explode*1.5;
  float sphere=smoothstep(radius,0.0,length(p)+n*(0.2+explode*0.5));
  float angle=atan(p.y,p.x);
  float rays=snoise(vec2(angle*3.0,length(p)-u_time*2.0))*explode;
  rays*=smoothstep(2.0,0.0,length(p));
  vec3 cyan=vec3(0.0,0.95,1.0); vec3 deepPurple=vec3(0.1,0.05,0.2); vec3 deepTeal=vec3(0.0,0.1,0.15);
  vec3 bg=mix(deepTeal,deepPurple,uv.y); vec3 color=mix(bg,cyan,sphere);
  color=mix(color,vec3(0.9,1.0,1.0),sphere*explode*0.8);
  color+=cyan*rays*1.2;
  float glow=exp(-2.0*length(p+vec2(n,n2)*0.1));
  color+=cyan*glow*(0.3+explode*0.7);
  color*=smoothstep(1.8,0.4,length(p));
  gl_FragColor=vec4(color,1.0);
}`;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('shader err', gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs_ = compile(gl.VERTEX_SHADER, vs);
    const fs_ = compile(gl.FRAGMENT_SHADER, fs);
    if (!vs_ || !fs_) { ro.disconnect(); return; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs_); gl.attachShader(prog, fs_);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { ro.disconnect(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    let raf;
    const render = ts => {
      sync();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, ts / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [hero]); // hero 載入後 canvas 才在 DOM，需要重跑

  const others = movies.filter(m => m.id !== hero?.id);

  if (!hero) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;

  return (
    <>
      {/* TopNav */}
      <nav className="fixed top-0 w-full z-50 bg-background/40 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center px-margin-desktop py-4 max-w-max-width mx-auto">
          <div className="font-display-lg text-[32px] tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">CINEMIST</div>
          <div className="hidden md:flex items-center space-x-8">
            <span className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md">Movies</span>
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-md text-label-md cursor-pointer">Cinemas</span>
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-md text-label-md cursor-pointer">Offers</span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="material-symbols-outlined text-primary hover:scale-110 transition-transform">search</button>
            <button className="material-symbols-outlined text-primary hover:scale-110 transition-transform">person</button>
          </div>
        </div>
      </nav>

      <main className="relative min-h-screen pt-20">
        {/* Hero */}
        <section className="relative h-[921px] w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* CSS fallback — WebGL 失敗時仍顯示動態光暈 */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(0,242,255,0.18) 0%, rgba(0,100,120,0.08) 40%, #131313 75%)',
              animation: 'hero-css-pulse 6s ease-in-out infinite',
            }} />
            <canvas ref={canvasRef} className="absolute inset-0" style={{ display: 'block', width: '100%', height: '100%' }} />
            <div className="absolute inset-0 hero-gradient" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end px-margin-desktop pb-24 max-w-max-width mx-auto">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center space-x-4 mb-6">
                <span className="bg-primary-container text-on-primary font-label-sm text-label-sm px-3 py-1 rounded-sm uppercase tracking-widest">{hero.genre}</span>
                <span className="text-primary font-label-sm text-label-sm flex items-center">
                  <span className="material-symbols-outlined text-[16px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  {hero.rating} Rating
                </span>
                <span className="text-on-surface-variant font-label-sm text-label-sm">{Math.floor(hero.durationMinutes / 60)}h {hero.durationMinutes % 60}m</span>
              </div>
              <h1 className="font-display-lg text-display-lg md:text-[96px] text-primary leading-none mb-6 drop-shadow-2xl">{hero.title}</h1>
              <p className="font-body-lg text-body-lg text-on-surface/80 mb-10 max-w-xl leading-relaxed">{hero.description}</p>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => navigate(`/movies/${hero.id}/dates`)}
                  className="digital-pulse bg-primary-container text-on-primary-container font-label-md text-label-md px-10 py-4 rounded-sm flex items-center hover:scale-105 transition-transform"
                >
                  <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  GET TICKETS
                </button>
                <button className="border border-primary text-primary font-label-md text-label-md px-10 py-4 rounded-sm bg-transparent hover:bg-primary/10 transition-colors">
                  ADD TO LIST
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Details section */}
        <section className="px-margin-desktop py-20 max-w-max-width mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-12">
            {/* THE CREW */}
            <div>
              <h3 className="font-headline-md text-headline-md text-primary mb-8 flex items-center">
                <span className="w-8 h-[2px] bg-primary mr-4" /> THE CREW
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'ELIAS THORNE', role: 'as Jax Neon', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJLGby7GrQhUMIFUOxnCxWqsTojVKxeoWxQmIcX9dae5HZ4OL2d9gBKY3QZru9byCQjwduJqlSargnpHlvUdd9Uv4yNmP9A7KaCV6wL5NABhJ3lYMhmnEmLz6csFBw_mJPRopm0_oHQVe7Js275VZgcXy4U-MmQp3Mb22wgclVetP9ERJCjSuoqWj09mRP9FJzczeVVCSx3In2Wdv00pQwC0-CBosB620SdhrCEcxJlUkqByqyy8XqONCuSNNHpELYNpvK4qvAcYjj' },
                  { name: 'SARAH VANCE',  role: 'as Cipher',   src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMKmcCOwYtu1nHyljz8XTFMyqL2iPr8tabS3ExzYv7_mjqegh4jOute86gNarDwoGw3ThmeXYPEEi8anZFRs3oy6_agAV1LXqqnqOA8rtkll4Uf0XESivHEgH05jsWPKQFQqL3rKeT8v6HzX6PMIt9Bb3WLu-_zLTTM3uEnRUDPpQZ54BOyhuqo30BLUb0kA6Uq2_Vc7UlMog3LL_q9Ko1gOCMxPqkdNOSCVvD0QvbhfvcL4sQQJZnVEs5tJVRAGe_Ul9WsQLAs0gX' },
                  { name: 'MARCUS REED',  role: 'as The Oracle', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_UmfdbgUW4XD3Nky2690N9kp5wdyqYyi8uIdzaB-b6C2pBwKxUphxOndAy6DqLm8ro3_gmtRMCFgySHn4jgFED3A90F3EvJiPvRBYHw8G4TmgA-WBZRx1Rpfma5PMJ8ncd3yr_uiaZGfRGMpYowIpqvJTh2WMpy26ctRo-r1cqJjGG12Sg_ucWr53cJsXYVOA0xiUUdD9sW9sIfVe8OVLMc_0toS2E_lAF3tluvyVQVWsOfxU-VvQCZcwy9swc9zYh7O_B_hqgpoW' },
                  { name: 'LENA CHEN',    role: 'as Maya',      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt89FwhzmO3pFuiT-69l7mGYVj4ZgB8QC9ZApbTrdPh_bFSq7pVM-rfKiMNvT3N0ZlfGxcZmi7BzEHRHT51aiylRUXoh-nJLTRfkeZRX_LWQr2flpPGuOzQMYR5BQr8RSHUmSDas-0UbLkQe3AjfznsfJR0b7YZm0iJFJSokFumFpiDUMAyVFy1_r7kaU7Osin7gqHU2jKzECVlPNWPbQrOYBHiwDtluM1k1kDNdkEA84tKyUDjHthBC931AXAIg_RSnJETaakfVGg' },
                ].map(c => (
                  <div key={c.name} className="group">
                    <div className="aspect-square overflow-hidden mb-3 border border-white/5 group-hover:border-primary/50 transition-colors">
                      <img src={c.src} alt={c.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <p className="font-label-md text-label-md text-on-surface">{c.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{c.role}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-6">SYNOPSIS</h3>
                <p className="text-on-surface/70 leading-relaxed font-body-md text-body-md">{hero.description}</p>
              </div>
              <div className="glass-panel p-8 rounded-lg">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-on-surface-variant font-label-md">Genre</span>
                    <span className="text-primary font-label-md">{hero.genre.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-on-surface-variant font-label-md">Rating</span>
                    <span className="text-primary font-label-md">{hero.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-label-md">Duration</span>
                    <span className="text-primary font-label-md">{Math.floor(hero.durationMinutes / 60)}h {hero.durationMinutes % 60}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky booking card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="glass-panel p-8 rounded-lg border-primary/20">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary">BOOK NOW</h4>
                    <p className="text-on-surface-variant font-label-sm mt-1">CINEMIST PRIME · TAIPEI</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="material-symbols-outlined text-primary">confirmation_number</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/movies/${hero.id}/dates`)}
                  className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-5 rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all font-bold shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                >
                  CONTINUE TO SEAT SELECTION
                </button>
                <div className="mt-6 text-center">
                  <p className="font-label-sm text-on-surface-variant">Tickets starting from $18.50</p>
                </div>
              </div>

              {/* Trailer Preview */}
              <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                <img
                  alt="Behind the scenes"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnnxAmjmqCcdxccN3YtMLBeSQ5-LrZX5aS-2IoCktQF2mrziYuxRShFa-j-pxekFboeW91bV55RWPRQHkYxDunJxt6q1N-MUqNPM0srldo3VLPH6T4iv5b0d5FI_KhbQfFbUNMsMZTHpeNQbIpNQYWNNfVrprOxtVpnOz2-wcqs99A2oHVUUrDwEwP3g2WTWqpy8Al7fUyXLnMEDBluQ5TDSISf-XitTO6BY2ILxnheY_Y-Dbajgqy93ElJgoOB9ItGwPoWevLIg5Z"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <p className="font-label-md text-primary">BEHIND THE SCENES</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More movies */}
        <section className="px-margin-desktop py-20 max-w-max-width mx-auto">
          <h3 className="font-headline-md text-headline-md text-primary mb-10">RECOMMENDED FOR YOU</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {others.map(m => (
              <div key={m.id} className="group cursor-pointer" onClick={() => navigate(`/movies/${m.id}/dates`)}>
                <div className="relative aspect-[2/3] overflow-hidden mb-4 rounded-sm border border-white/10">
                  <img alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={m.posterUrl} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4">
                    <span className="font-label-sm text-primary-container border border-primary-container px-2 py-0.5">{m.rating}</span>
                  </div>
                </div>
                <p className="font-label-md text-on-surface group-hover:text-primary transition-colors">{m.title}</p>
                <p className="font-label-sm text-on-surface-variant">{m.genre}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-20 bg-surface-container-lowest bg-gradient-to-t from-background to-surface-container-lowest">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin-desktop py-16 max-w-max-width mx-auto">
          <div>
            <div className="font-headline-md text-headline-md text-primary mb-6">CINEMIST</div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">The premium destination for cinematic excellence. Experience the future of entertainment today.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-primary font-label-md mb-4">SOCIAL</h5>
              <span className="block text-on-surface-variant hover:text-primary transition-colors font-body-md cursor-pointer">Facebook</span>
              <span className="block text-on-surface-variant hover:text-primary transition-colors font-body-md cursor-pointer">Instagram</span>
              <span className="block text-on-surface-variant hover:text-primary transition-colors font-body-md cursor-pointer">YouTube</span>
            </div>
            <div className="space-y-2">
              <h5 className="text-primary font-label-md mb-4">LOCATIONS</h5>
              <span className="block text-on-surface-variant hover:text-primary transition-colors font-body-md cursor-pointer">Taipei</span>
              <span className="block text-on-surface-variant hover:text-primary transition-colors font-body-md cursor-pointer">Tokyo</span>
              <span className="block text-on-surface-variant hover:text-primary transition-colors font-body-md cursor-pointer">Singapore</span>
            </div>
          </div>
          <div>
            <h5 className="text-primary font-label-md mb-4">NEWSLETTER</h5>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="bg-black border border-white/10 text-primary p-3 w-full focus:border-primary focus:outline-none" />
              <button className="bg-primary-container text-on-primary-container px-6 hover:brightness-110 transition-all">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <p className="text-on-surface-variant font-label-sm mt-8">© 2026 CINEMIST. POWERED BY DIGITAL ENERGY.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
