export default function DownloadComponent() {
  return (
    <div className="bg-customBlack-200 p-9 rounded-lg">
      <h1 className="font-semibold text-md">Download Data</h1>
      <button
        type="button"
        class="relative w-[150px] h-[40px] cursor-pointer flex items-center border border-[#17795E] bg-customGreen-100 overflow-hidden transition-all duration-300 group hover:bg-customGreen-200 active:border-[#146c54]"
      >
        <span class="transition-all duration-300 transform translate-x-[22px] text-white text-xs group-hover:text-transparent">
          JSON File
        </span>
        <span class="transition-all duration-300 absolute transform translate-x-[109px] h-full w-[39px] bg-customGreen-200 flex items-center justify-center group-hover:w-[148px] group-hover:translate-x-0 active:bg-customGreen-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 35 35"
            class="w-[20px] fill-white"
          >
            <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
            <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
            <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
          </svg>
        </span>
      </button>
    </div>
  );
}
