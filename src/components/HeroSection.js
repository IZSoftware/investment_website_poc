import React, { useState, useEffect } from "react";
import { getSiteInfo } from "../api/services";

const HeroSection = () => {
  const backgroundImage = "/modern-business-buildings.jpg";

  const [rotatingTags, setRotatingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchClusters = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await getSiteInfo();

        if (!isMounted) return;

        const clusters = res?.data?.clusters;

        if (!Array.isArray(clusters)) {
          throw new Error("Invalid cluster data received");
        }

        const names = clusters
          .map((cluster) => cluster.name)
          .filter(Boolean);

        setRotatingTags(names);
      } catch (error) {
        console.error("Failed to load cluster tags:", error);

        if (isMounted) {
          setError(true);
          setRotatingTags([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClusters();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderClusterTags = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-3 text-white">
          <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
          <span className="text-base font-medium sm:text-lg">
            Loading investments...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <p className="text-base text-white/80 sm:text-lg">
          Unable to load investment sectors.
        </p>
      );
    }

    if (rotatingTags.length === 0) {
      return null;
    }

    return (
      <>
        {/* Desktop and tablet */}
        <div className="hidden max-w-5xl sm:block">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 lg:gap-x-6">
            {rotatingTags.map((tag, index) => (
              <React.Fragment key={`${tag}-${index}`}>
                <span className="text-base font-medium text-white sm:text-lg md:text-xl lg:text-2xl whitespace-nowrap">
                  {tag}
                </span>

                {index < rotatingTags.length - 1 && (
                  <span className="text-xl font-light text-white lg:text-2xl">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          <div className="max-w-xs space-y-3">
            {rotatingTags.map((tag, index) => (
              <div
                key={`${tag}-${index}`}
                className="text-lg font-medium text-white"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <section className="relative flex items-center min-h-screen">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover mb-9"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-black bg-opacity-60" />

      <div className="relative z-10 w-full">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />

          <div className="col-span-12 lg:col-span-10">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="w-full py-12 lg:py-20 xl:py-32">

                {/* Headline */}
                <div className="max-w-5xl mb-6 lg:mb-8">
                  <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                    Strategic Investments
                  </h1>
                </div>

                {/* Subheadline */}
                <h2 className="max-w-3xl mb-8 text-2xl font-semibold tracking-wider text-white sm:text-3xl md:text-4xl lg:text-5xl lg:mb-12">
                  Across Africa
                </h2>

                {/* Divider */}
                <div className="w-32 h-1 mb-8 bg-white lg:mb-12" />

                {/* Dynamic API data */}
                {renderClusterTags()}

                {/* CTA */}
                <div className="mt-12 lg:mt-16">
                  <button
                    className="px-8 py-3 text-lg font-semibold text-gray-900 transition-all duration-300 transform bg-white rounded-full shadow-lg hover:bg-gray-100 lg:py-4 lg:px-12 lg:text-xl hover:scale-105 hover:shadow-xl"
                  >
                    Explore Our Portfolio
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className="hidden col-span-1 lg:block" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;