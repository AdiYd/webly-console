'use client';
import { useTheme } from '../ui/theme-provider';

const BlurDecoratives = () => {
  const { theme, isDarkTheme } = useTheme(); // Get the current theme from the context
  return (
    <>
      {/* <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-gradient-to-tr from-[#1e1e2f]/10 to-[#16161d]/5 opacity-50 blur-[200px] -z-10"></div> */}
      {/* <div className="absolute top-0 right-0 w-[100vw] h-[100vh] bg-gradient-to-br from-[#1e1e2f] to-[#16161d] opacity-50 blur-[200px] -z-10"></div> */}
      <div
        style={{ animationDuration: '35s' }}
        className={`absolute animate-spin top-[-10vh] right-[-20vw] w-1/2 h-1/2 rounded-full bg-gradient-to-r ${
          isDarkTheme
            ? 'from-emerald-400/30 to-violet-400/30'
            : 'from-emerald-500/10 to-violet-500/10'
        } blur-[100px]`}
      />
      <div
        style={{}}
        className={`absolute animate-spin* bottom-0 left-[-10vw] w-1/2 h-1/4 rounded-full bg-gradient-to-r ${
          isDarkTheme ? 'from-amber-400/30 to-pink-400/30' : 'from-amber-300/10 to-pink-400/10'
        } blur-[100px]`}
      />
      <div
        style={{ animationDuration: '40s' }}
        className={`absolute animate-spin top-[-30vh] left-[-20vw] w-1/2 h-1/2 rounded-full bg-gradient-to-r ${
          isDarkTheme ? 'from-purple-400/30 to-pink-400/30' : 'from-purple-500/10 to-pink-500/10'
        } blur-[100px]`}
      />
      <div
        style={{}}
        className={`absolute animate-spin* bottom-0 right-[-10vw] w-1/2 h-1/4 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-[100px]`}
      />
    </>
  );
};

export default BlurDecoratives;
