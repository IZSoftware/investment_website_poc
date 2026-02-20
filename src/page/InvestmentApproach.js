import React from 'react';
import { Quote } from 'lucide-react';

const investmentData = {
  hero: {
    title: "Investment Approach",
    description: "The fund is invested in international equities, bonds, real estate and renewable energy infrastructure. Investments are spread across most markets, countries and currencies to achieve broad exposure to global growth and value creation. The fund has a long-term investment horizon and limited liquidity needs."
  },
  quotes: [
    {
      id: 1,
      text: "NF Holding manages the fund transparently and responsibly with the aim of achieving the highest possible return after costs.",
      author: "NF Holding"
    },
    {
      id: 2,
      text: "Our investment strategies are grouped into three main strategies: market exposure, security selection, and fund allocation.",
      author: "Investment Strategy"
    }
  ],
  sections: [
    {
      title: "Investment Approach evolution",
      content: "The investment strategy has evolved over time on the basis of expert reviews, practical experience and in-depth analysis. Major changes require parliamentary approval. The investment strategy aims to take advantage of the fund's long-term horizon and considerable size to generate strong return and safeguard wealth for future generations."
    },
    {
      title: "Investment mandate",
      content: "NF HoldingBank Investment Management manages the fund transparently and responsibly with the aim of achieving the highest possible return after costs within the constraints imposed by the mandate from the Ministry of Finance.\n\nThe fund's overall investment strategy is defined in the management mandate set by the Ministry of Finance. The mandate specifies which markets the fund can be invested in, and how much can be invested in the different asset classes, equities, bonds, unlisted real estate and unlisted renewable energy infrastructure.\n\nIt follows from the management mandate that we shall seek to achieve the highest possible return after costs, given an acceptable level of risk. The return on the fund is measured against a benchmark index set by the Ministry of Finance. The mandate also sets out how much and what types of risk NF HoldingBank can take in its management of the fund. Within the scope of our financial objective, we manage the fund responsibly."
    },
    {
      title: "Benchmark index",
      content: "The benchmark index plays a key role in the management of the fund. The index is constructed on the basis of indices from FTSE Russell Group (equities) and Bloomberg (bonds). The strategic benchmark index consists of equities and bonds with fixed weights of 70 and 30 percent respectively.\n\nNF HoldingBank can choose to construct a portfolio that differs somewhat from the benchmark in order to exploit the fund's special characteristics and competitive advantages, for example by investing in real estate and renewable energy infrastructure, and ensure cost-effective management of the fund. This deviation from the benchmark index is limited by a ceiling for expected relative volatility, or tracking error, of 1.25 percent.\n\nEquity prices and bond prices will normally move differently, causing the equity share in the benchmark index to vary from the fixed weight of 70 percent. The mandate sets a limit for this drift of 2 percentage points before rebalancing is required back to the 70 percent target."
    },
    {
      title: "Investment Approach",
      content: "The Executive Board's strategic plan sets out which strategies NF HoldingBank Investment Management is to employ in its management of the fund.\n\nOur goal is to maximise return after costs, given an acceptable level of risk. To achieve this, we use a range of investment strategies and take advantages of the fund being large and long-term.\n\nOur investment strategies are grouped into three main strategies: market exposure, security selection, and fund allocation. We report risk and performance according to these three main strategies. These strategies are pursued across equity, fixed income, and real asset management.\n\nWe manage the fund close to the benchmark index, but all our investment processes have active elements. This improves our ability to achieve the highest possible return and to be a responsible investor.\n\nReturn and cost is disclosed in our annual report by investment strategy, including the split between external and internal managers."
    },
    {
      title: "Equity investments",
      content: "The fund is a large investor in global equity markets. Our equity management is based on two main strategies: market exposure and security selection. These enable broad exposure to the equity market while increasing return through enhanced indexing and fundamental investing.\n\nWe manage most of our equity portfolio through our market exposure strategy. We invest broadly in the companies in our benchmark but avoid mechanical replication to reduce costs. We enhance return through diversified index refinement strategies that systematically exploit market inefficiencies and liquidity imbalances. Given our size and global reach, it is critical to manage our market exposure and transactions efficiently.\n\nOur security selection strategy is based on in-depth company knowledge. Expertise and delegated authority enable our portfolio managers to identify long-term opportunities and take investment decisions based on conviction rather than consensus. As a large and long-term owner, we benefit from access to companies that few investors can match. We leverage this advantage to deepen our understanding of industry and company dynamics."
    },
    {
      title: "Fixed-income investments",
      content: "The fund is invested in a broad range of bonds issued by government and related institutions, as well as companies. Our fixed-income portfolio dampens fund volatility, provided liquidity, and enhances fund return by harvesting risk premia in the bond market. The strategies aim to build cost-effective portfolios with exposure to key risk drivers, while also seizing opportunities at the security, issuer and sector level.\n\nWe also use the main strategies of market exposure and security selection for our fixed-income management.\n\nIn our market exposure strategy, we seek to achieve the desired benchmark exposure in developed markets as cost-effectively as possible. We enhance return by being active in capital market events and taking short- to medium-term positions based on fundamental research and temporary price differences of similar bonds.\n\nIn our security selection strategy, we seek to improve return through in-depth company analysis and by harvesting risk premia in the corporate bond market. We also invest selectively in fixed-income segments outside the benchmark index as part of our allocation strategy."
    },
    {
      title: "Real assets investments",
      content: "The management mandate allows us to invest up to 7 percent of the fund in unlisted real estate and up to 2 percent in renewable energy infrastructure. We invest in real assets to maximise return after costs. We believe that achieving this goal also improves the long-term trade-off between return and risk in the fund, and that the fund's characteristics position us to achieve our goal.\n\nReal estate is a large part of the overall investable market. We invest in large, traditional sectors such as office and logistics, but will gradually invest more in newer and higher growth sectors to achieve broader sector diversification. We will to a larger extent delegate the operational management of the real estate portfolio and gradually invest more through indirect structures.\n\nThe energy transition creates substantial investment opportunities in both renewable generation and enabling infrastructure. We are building a diversified portfolio across technologies and geographies. We invest directly in wind and solar power, and will increase investments in distribution and storage as investment opportunities arise. We will gradually invest more through indirect structures."
    }
  ]
};

export default function InvestmentApproach() {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-12 sm:px-6 lg:px-8">
            
            {/* Hero Section */}
            <div className="bg-[#F5F5F7] rounded-2xl p-8 mb-16">
              <h1 className="text-5xl font-semibold text-[#1D1D1F] tracking-tight mb-6 lg:text-6xl">
                {investmentData.hero.title}
              </h1>
              <p className="text-xl text-[#6E6E73] leading-relaxed max-w-4xl text-justify">
                {investmentData.hero.description}
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-7">
                <div className="space-y-12">
                  {investmentData.sections.map((section, index) => (
                    <div key={index} className="prose prose-lg max-w-none">
                      <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-4">
                        {section.title}
                      </h2>
                      {section.content.split('\n\n').map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-base text-[#6E6E73] leading-relaxed mb-4 text-justify">
                          {paragraph}
                        </p>
                      ))}
                      {index < investmentData.sections.length - 1 && (
                        <hr className="my-8 border-t border-[#D2D2D7]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Quotes */}
              <div className="lg:col-span-4 lg:col-start-9">
                <div className="space-y-8 lg:sticky lg:top-24">
                  {investmentData.quotes.map((quote) => (
                    <div key={quote.id} className="bg-[#F5F5F7] rounded-2xl p-8 relative">
                      <Quote className="absolute top-6 right-6 text-[#D2D2D7]" size={32} />
                      <p className="text-lg text-[#1D1D1F] leading-relaxed mb-4 text-justify">
                        "{quote.text}"
                      </p>
                      <p className="text-sm font-medium text-[#6E6E73]">
                        — {quote.author}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .prose h2 { font-family: 'Inter', sans-serif; font-weight: 600; color: #1D1D1F; }
        .prose p  { font-family: 'Inter', sans-serif; color: #6E6E73; line-height: 1.7; }
        .prose hr { border-color: #D2D2D7; }
      `}</style>
    </div>
  );
}