const BlurDecoratives = () => {
  return (
    <>
      {/* <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-gradient-to-tr from-[#1e1e2f]/10 to-[#16161d]/5 opacity-50 blur-[200px] -z-10"></div> */}
      {/* <div className="absolute top-0 right-0 w-[100vw] h-[100vh] bg-gradient-to-br from-[#1e1e2f] to-[#16161d] opacity-50 blur-[200px] -z-10"></div> */}
      <div className="absolute top-[-10vh] right-[-20vw] w-1/2 h-1/2 rounded-full bg-gradient-to-r from-emerald-500/10 to-violet-500/10 blur-[100px]" />
      <div className="absolute bottom-0 left-[-10vw] w-1/2 h-1/4 rounded-full bg-gradient-to-r from-amber-300/10 to-pink-400/10 blur-[100px]" />
      <div className="absolute top-0 left-[-10vw] w-1/2 h-1/4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-[100px]" />
      <div className="absolute bottom-0 right-[-10vw] w-1/2 h-1/4 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-[100px]" />
    </>
  );
};

export default BlurDecoratives;
