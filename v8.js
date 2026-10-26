// Halaman scroll di dalam .page (menu bawah selalu terlihat), jadi reset scroll ke atas saat pindah halaman.
(function(){const g=window.go;window.go=function(id,b){g(id,b);const p=document.getElementById(id);if(p)p.scrollTop=0}})();
