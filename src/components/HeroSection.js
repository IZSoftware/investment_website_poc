import React from 'react';

const HeroSection = () => {
  const backgroundImage = "/modern-business-buildings.jpg";

  // All hero content is now static
  const heroData = {
    headline: "Strategic Investments",
    subheadline: "Across Africa",
    rotatingTags: ["Energy", "Power", "Finance", "Technology", "Real Estate", "Hospitality"],
    ctaLabel: "Explore Our Portfolio",
  };

  const { headline, subheadline, rotatingTags, ctaLabel } = heroData;

  return (
    <section className="relative flex items-center min-h-screen">
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover mb-9"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-black bg-opacity-60"></div>

      <div className="relative z-10 w-full">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>

          <div className="col-span-12 lg:col-span-10">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="w-full py-12 lg:py-20 xl:py-32">

                <div className="max-w-5xl mb-6 lg:mb-8">
                  <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                    {headline}
                  </h1>
                </div>

                <h2 className="max-w-3xl mb-8 text-2xl font-semibold tracking-wider text-white sm:text-3xl md:text-4xl lg:text-5xl lg:mb-12">
                  {subheadline}
                </h2>

                <div className="w-32 h-1 mb-8 bg-white lg:mb-12"></div>

                <div className="hidden max-w-5xl sm:block">
                  <div className="flex items-center gap-x-4 lg:gap-x-6 gap-y-3">
                    {rotatingTags.map((tag, index) => (
                      <React.Fragment key={index}>
                        <span className="text-base font-medium text-white sm:text-lg md:text-xl lg:text-2xl whitespace-nowrap">
                          {tag}
                        </span>
                        {index < rotatingTags.length - 1 && (
                          <span className="text-xl font-light text-white lg:text-2xl">|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="sm:hidden">
                  <div className="max-w-xs space-y-3">
                    {rotatingTags.map((tag, index) => (
                      <div key={index} className="text-lg font-medium text-white">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 lg:mt-16">
                  <button className="px-8 py-3 text-lg font-semibold text-gray-900 transition-all duration-300 transform bg-white rounded-full shadow-lg hover:bg-gray-100 lg:py-4 lg:px-12 lg:text-xl hover:scale-105 hover:shadow-xl">
                    {ctaLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;