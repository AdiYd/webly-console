'use client';
import { useTheme } from '../../context/theme-provider';

const BlurDecoratives = () => {
  const { theme, isDarkTheme } = useTheme(); // Get the current theme from the context
  return (
    <>
      {/* <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-gradient-to-tr from-[#1e1e2f]/10 to-[#16161d]/5 opacity-50 blur-[200px] -z-10"></div> */}
      {/* <div className="absolute top-0 right-0 w-[100vw] h-[100vh] bg-gradient-to-br from-[#1e1e2f] to-[#16161d] opacity-50 blur-[200px] -z-10"></div> */}
      <div
        className={`absolute top-[-30vh] right-[-30vw] w-1/2 h-1/2 rounded-full bg-gradient-to-r ${
          isDarkTheme
            ? 'from-purple-200/40 to-violet-400/40'
            : 'from-purple-300/40 to-violet-400/40'
        } blur-[200px]`}
      />
      <div
        className={`absolute overflow-hidden bottom-0 left-[-30vw] w-1/2 h-1/3 rounded-full bg-gradient-to-r ${
          isDarkTheme
            ? 'from-orange-400/40 to-violet-400/40'
            : 'from-orange-300/40 to-violet-400/40'
        } blur-[200px]`}
      />
      <div
        style={{}}
        className={`absolute bottom-0 right-[-30%] w-1/2 h-1/5 rounded-full bg-gradient-to-r ${
          isDarkTheme ? 'from-amber-400/80 to-pink-400/50' : 'from-green-400/40 to-blue-400/30'
        } blur-[200px]`}
      />
      {!isDarkTheme && (
        <div
          className={`absolute top-[-30vh] left-[-20vw] w-1/2 h-1/2 rounded-full bg-gradient-to-r ${
            isDarkTheme ? 'from-purple-400/40 to-pink-400/40' : 'from-purple-500/10 to-pink-500/10'
          } blur-[100px]`}
        />
      )}
      <div
        style={{}}
        className={`absolute top-0 left-[-10vw] w-1/2 h-1/4 rounded-full bg-gradient-to-r from-primary/20 to-accent/30 blur-[150px]`}
      />
    </>
  );
};

export default BlurDecoratives;
