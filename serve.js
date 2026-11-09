/* Servidor estático simple para bioferia-descenso: soporta Range (videos) y no se cae si un archivo falla o hay muchos pedidos a la vez. */
const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');
const ROOT=__dirname,PORT=+process.env.PORT||5192;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.ico':'image/x-icon','.woff2':'font/woff2','.gif':'image/gif'};
process.on('uncaughtException',e=>console.error('error no capturado:',e.code||e.message));
http.createServer((req,res)=>{
  let p;try{p=decodeURIComponent(url.parse(req.url).pathname)}catch(e){res.writeHead(400);return res.end()}
  if(p.endsWith('/'))p+='index.html';
  const f=path.normalize(path.join(ROOT,p));
  if(!f.startsWith(ROOT)){res.writeHead(403);return res.end()}
  fs.stat(f,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404);return res.end('no encontrado')}
    const type=MIME[path.extname(f).toLowerCase()]||'application/octet-stream',h={'Content-Type':type,'Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    let s=0,e=st.size-1,code=200;const r=req.headers.range&&/bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if(r){if(r[1]!=='')s=+r[1];if(r[2]!=='')e=Math.min(+r[2],st.size-1);if(r[1]===''&&r[2]!=='')s=Math.max(0,st.size-+r[2]);if(s>e||s>=st.size){res.writeHead(416,{'Content-Range':'bytes */'+st.size});return res.end()}code=206;h['Content-Range']=`bytes ${s}-${e}/${st.size}`}
    h['Content-Length']=e-s+1;res.writeHead(code,h);
    if(req.method==='HEAD')return res.end();
    const rs=fs.createReadStream(f,{start:s,end:e});
    rs.on('error',()=>{try{res.destroy()}catch(x){}});
    res.on('close',()=>rs.destroy());
    rs.pipe(res)})
}).listen(PORT,()=>console.log('bioferia-descenso en http://localhost:'+PORT));
