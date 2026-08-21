import React, { useState, useEffect } from 'react';
import { getPublicLeadership, getPublicFoundation, getPublicMedia } from '../api/services';

const getEmbedUrl = (videoUrl) => {
  if (!videoUrl) return null;
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  if (/^[\w-]{11}$/.test(videoUrl)) return `https://www.youtube.com/embed/${videoUrl}?autoplay=1&rel=0`;
  return videoUrl;
};

const LeadershipPhilanthropy = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  const [leader, setLeader] = useState({
    quote: "\"The private sector has a role to play in advancing Africa's development.\"",
    personName: "Victor Edwards",
    role: "FOUNDER & CHAIRMAN, NF Holding",
    photoUrl: "/african-american-business-man-suit.jpg", // always local — never overwritten from API
  });

  const [foundation, setFoundation] = useState({
    title: "The Victor Edwards Foundation",
    body: "Empowering entrepreneurship as a catalyst for economic growth: Our philosophy of 'doing well and doing good' drives both our business and philanthropic initiatives, reflecting our belief that sustainable impact begins with opportunity.",
    ctaLabel: "MORE ON OUR PHILANTHROPY",
    ctaUrl: "#",
    imageUrl: "/children foundation.jpg", // always local — never overwritten from API
  });

  const [media, setMedia] = useState({
    title: "Investing in Africa's Future",
    description: "NF Holding is committed to improving lives and transforming Africa. We are focused on driving Africa's economic transformation by investing in critical sectors that matter most to the continent's development. Watch the video to discover how we are investing in Africa's future.",
    videoUrl: "_zShxJofkjU",
    thumbnailUrl: "/video-thumbnail.jpg", // always local — never overwritten from API
    durationLabel: "2:45 min",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLeadership = async () => {
      try {
        const res = await getPublicLeadership();
        if (isMounted && Array.isArray(res?.data) && res.data.length > 0) {
          const first = res.data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
          setLeader((prev) => ({
            ...prev,
            quote: first.quote || prev.quote,
            personName: first.personName || prev.personName,
            role: first.role || prev.role,
            // photoUrl intentionally NOT included — stays on the local image above
          }));
        }
      } catch (error) {
        console.error('Failed to load leadership:', error);
      }
    };

    const fetchFoundation = async () => {
      try {
        const res = await getPublicFoundation();
        if (isMounted && res?.data) {
          setFoundation((prev) => ({
            ...prev,
            title: res.data.title || prev.title,
            body: res.data.body || prev.body,
            ctaLabel: res.data.ctaLabel || prev.ctaLabel,
            ctaUrl: res.data.ctaUrl || prev.ctaUrl,
            // imageUrl intentionally NOT included — stays on the local image above
          }));
        }
      } catch (error) {
        console.error('Failed to load foundation content:', error);
      }
    };

    const fetchMedia = async () => {
      try {
        const res = await getPublicMedia();
        if (isMounted && Array.isArray(res?.data) && res.data.length > 0) {
          const first = res.data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
          setMedia((prev) => ({
            ...prev,
            title: first.title || prev.title,
            description: first.description || prev.description,
            videoUrl: first.videoUrl || prev.videoUrl, // actual video content — stays API-driven
            durationLabel: first.durationLabel || prev.durationLabel,
            // thumbnailUrl intentionally NOT included — stays on the local image above
          }));
        }
      } catch (error) {
        console.error('Failed to load media:', error);
      }
    };

    fetchLeadership();
    fetchFoundation();
    fetchMedia();
    return () => { isMounted = false; };
  }, []);

  const embedUrl = getEmbedUrl(media.videoUrl);

  return (
    <section className="py-16 bg-white lg:py-24">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">

            <div className="grid items-center grid-cols-1 gap-12 mb-20 lg:grid-cols-2 lg:gap-16 lg:mb-24">
              <div>
                <div className="mb-8">
                  <div className="mb-6 text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
                    {leader.quote}
                  </div>
                  <div className="text-gray-600 border-l-4 border-[#0A2540] pl-4">
                    <div className="text-lg font-semibold">- {leader.personName}</div>
                    <div className="mt-1 text-gray-500">{leader.role}</div>
                  </div>
                </div>
              </div>

              <div className="order-first lg:order-last">
                <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                  <img
                    src={leader.photoUrl}
                    alt={leader.personName}
                    className="object-cover w-full h-90 lg:h-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid items-center grid-cols-1 gap-12 mb-20 lg:grid-cols-2 lg:gap-16 lg:mb-24">
              <div>
                <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                  <img
                    src={foundation.imageUrl}
                    alt={foundation.title}
                    className="object-cover w-full h-90 lg:h-100"
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
                  {foundation.title}
                </h2>

                <p className="mb-8 text-lg leading-relaxed text-justify text-gray-700">
                  {foundation.body}
                </p>

                <a
                  href={foundation.ctaUrl}
                  className="inline-block bg-[#0A2540] hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {foundation.ctaLabel}
                </a>
              </div>
            </div>

            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
                  {media.title}
                </h2>

                <p className="mb-8 text-lg leading-relaxed text-justify text-gray-700">
                  {media.description}
                </p>

                {!videoPlaying ? (
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="bg-[#0A2540] hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    WATCH OUR TELEVISION COMMERCIAL
                  </button>
                ) : (
                  <button
                    onClick={() => setVideoPlaying(false)}
                    className="px-8 py-3 font-semibold text-white transition-all duration-300 bg-gray-600 rounded-full hover:bg-gray-700"
                  >
                    Hide Video
                  </button>
                )}
              </div>

              <div>
                {videoPlaying ? (
                  <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                    <div className="relative pt-[56.25%]">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-2xl"
                        src={embedUrl}
                        title={media.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setVideoPlaying(true)}
                    className="relative overflow-hidden shadow-2xl cursor-pointer rounded-2xl group"
                  >
                    <img
                      src={media.thumbnailUrl}
                      alt="Watch our television commercial"
                      className="object-cover w-full transition-transform duration-500 h-80 lg:h-96 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="text-white">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-12 h-12 mr-3 bg-white rounded-full">
                            <svg className="w-6 h-6 text-[#0A2540]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-semibold">Play Video</span>
                        </div>
                        <div className="text-sm opacity-90">{media.durationLabel}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </section>
  );
};

export default LeadershipPhilanthropy;