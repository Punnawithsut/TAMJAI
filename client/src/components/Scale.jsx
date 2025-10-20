const Scale = (props) => {
    const clampedValue = Math.max(0, Math.min(100, props.value));

  return <div className="w-11/12 mt-10 mb-5">
            <div className="relative w-full h-6 rounded-full bg-gray-300">
                <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#1800ad]"
                    style={{ width: `${clampedValue}%` }}
                ></div>
            </div>
         </div>;
};

export default Scale;
