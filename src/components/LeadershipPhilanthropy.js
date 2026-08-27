import React, { useState, useEffect } from "react";
import { getSiteInfo } from "../api/services";

const LeadershipPhilanthropy = () => {
  const [leader, setLeader] = useState({
    quote:
      "The private sector has a role to play in advancing Africa's development.",
    personName: "Victor Edwards",
    role: "FOUNDER & CHAIRMAN, NF Holding",
    photoUrl: "/african-american-business-man-suit.jpg",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchChairman = async () => {
      try {
        const res = await getSiteInfo();

        if (!isMounted) return;

        const data = res?.data;

        if (!data) return;

        setLeader((prev) => ({
          ...prev,
          quote: data.chairmanMessage || prev.quote,
          personName: data.chairmanName || prev.personName,
          photoUrl: data.chairmanImage || prev.photoUrl,
        }));
      } catch (error) {
        console.error("Failed to load chairman info:", error);
      }
    };

    fetchChairman();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 bg-white lg:py-24">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Chairman Message */}
              <div>
                <p className="mb-3 text-sm font-semibold tracking-widest text-[#0A2540] uppercase">
                  A Message From Our Chairman
                </p>

                <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
                  {leader.personName}
                </h2>

                <p className="mb-6 text-lg leading-relaxed text-justify text-gray-700">
                  {leader.quote}
                </p>

                <div className="pl-4 text-gray-600 border-l-4 border-[#0A2540]">
                  <div className="text-lg font-semibold">
                    {leader.personName}
                  </div>

                  <div className="mt-1 text-gray-500">
                    {leader.role}
                  </div>
                </div>
              </div>

              {/* Chairman Image */}
              <div className="order-first lg:order-last">
                <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                  <img
                    src={leader.photoUrl}
                    alt={leader.personName}
                    className="object-cover object-[center_20%] w-full h-72 sm:h-96 lg:h-[500px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden col-span-1 lg:block" />
      </div>
    </section>
  );
};

export default LeadershipPhilanthropy;