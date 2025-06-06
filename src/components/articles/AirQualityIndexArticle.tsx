import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Globe } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

const AirQualityIndexArticle: React.FC = () => {
  const [language, setLanguage] = useState<'TH' | 'EN'>('EN');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'TH' : 'EN');
  };

  const content = {
    EN: {
      title: "Air Quality Index",
      source: "from airtw.moenv.gov.tw",
      content: (
        <>
          <h2 className="maintitle text-xl font-bold mb-4">Air Quality Index</h2>
          <div className="article mb-6">
            <h3 className="text-lg font-semibold mb-3">The definition of air pollution indicators</h3>
          </div>
          <div className="article_con article_target">
            <p className="mb-4">
              Air quality index based on monitoring data will be on the same day in the air ozone(O₃), fine particulate matter(PM₂.₅), particulate matter(PM₁₀), carbon monoxide(CO), sulfur dioxide(SO₂) and II Nitric oxide(NO₂) such as the concentration of value, its impact on human health, were converted into different pollutants The vice-value targets, indicators, deputy to the day of the maximum value of the stations on the day of the air quality index (AQI).
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-3">Introduction to air pollutants</h4>
              <div className="space-y-3">
                <div><strong>● PM₂.₅</strong><br />Construction site, transboundary, industry, open burning or Traffic caused pollution(surface aeolian dust or motor vehicle pollution)</div>
                <div><strong>● PM₁₀</strong><br />Construction site, transboundary, industry, open burning or Traffic caused pollution(surface aeolian dust or motor vehicle pollution)</div>
                <div><strong>● SO₂</strong><br />Volcanic gas or sulfufric burning in fossil fuel</div>
                <div><strong>● NOₓ</strong><br />Nitrogen Oxide is formed during the process of nitride combustion. Nitride is the product of nitrogen oxide photochemical reaction.</div>
                <div><strong>● CO</strong><br />Forest fire, methane nitridation, biological activity or incomplete combustion of fuel.</div>
                <div><strong>● O₃</strong><br />Secondary pollutants from nitrogen oxide, reactive hydrocarbons, or photochemical reaction.</div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">AQI Categories</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Good (0-50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Moderate (51-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Unhealthy for Sensitive Groups (101-150)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Unhealthy (151-200)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Very Unhealthy (201-300)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-900 rounded"></div>
                  <span>Hazardous (301-500)</span>
                </div>
              </div>
            </div>
          </>
        )
    },
    TH: {
      title: "ดัชนีคุณภาพอากาศ",
      source: "จาก airtw.moenv.gov.tw",
      content: (
        <>
          <h2 className="maintitle text-xl font-bold mb-4">ดัชนีคุณภาพอากาศ</h2>
          <div className="article mb-6">
            <h3 className="text-lg font-semibold mb-3">คำนิยามของตัวบ่งชี้มลพิษทางอากาศ</h3>
          </div>
          <div className="article_con article_target">
            <p className="mb-4">
              ดัชนีคุณภาพอากาศจากข้อมูลการตรวจวัดจะอิงจากค่าความเข้มข้นของโอโซน (O₃), ฝุ่นละอองขนาดเล็ก (PM₂.₅), ฝุ่นละออง (PM₁₀), คาร์บอนมอนอกไซด์ (CO), ซัลเฟอร์ไดออกไซด์ (SO₂) และไนโตรเจนไดออกไซด์ (NO₂) ในวันเดียวกัน โดยแปลงผลกระทบต่อสุขภาพมนุษย์เป็นค่าตัวบ่งชี้ย่อยต่างๆ และใช้ค่าสูงสุดเป็นดัชนีคุณภาพอากาศ (AQI) ของสถานีในวันนั้น
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-3">ข้อมูลสารมลพิษทางอากาศ</h4>
              <div className="space-y-3">
                <div><strong>● PM₂.₅</strong><br />มลพิษจากการก่อสร้าง อุตสาหกรรม การเผาไหม้ หรือการจราจร (ฝุ่นละอองจากพื้นผิวหรือยานพาหนะ)</div>
                <div><strong>● PM₁₀</strong><br />มลพิษจากการก่อสร้าง อุตสาหกรรม การเผาไหม้ หรือการจราจร (ฝุ่นละอองจากพื้นผิวหรือยานพาหนะ)</div>
                <div><strong>● SO₂</strong><br />ก๊าซจากภูเขาไฟหรือการเผาไหม้เชื้อเพลิงฟอสซิลที่มีกำมะถัน</div>
                <div><strong>● NOₓ</strong><br />ไนโตรเจนออกไซด์เกิดขึ้นจากกระบวนการเผาไหม้ เป็นผลิตภัณฑ์จากปฏิกิริยาเคมีแสงของไนโตรเจนออกไซด์</div>
                <div><strong>● CO</strong><br />จากไฟป่า การเผาไหม้มีเทนที่ไม่สมบูรณ์ กิจกรรมทางชีวภาพ หรือการเผาไหม้เชื้อเพลิงที่ไม่สมบูรณ์</div>
                <div><strong>● O₃</strong><br />สารมลพิษทุติยภูมิจากไนโตรเจนออกไซด์ สารไฮโดรคาร์บอนที่ว่องไว หรือปฏิกิริยาเคมีแสง</div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">ระดับ AQI</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>ดี (0-50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>ปานกลาง (51-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>ไม่ดีต่อกลุ่มเสี่ยง (101-150)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>ไม่ดีต่อสุขภาพ (151-200)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>อันตรายมาก (201-300)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-900 rounded"></div>
                  <span>อันตรายอย่างมาก (301-500)</span>
                </div>
              </div>
            </div>
          </>
        )
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white mr-3 hover:bg-blue-400/30 rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <AppLogo size="md" className="mr-4" />
            <h1 className="text-xl font-bold">{content[language].title}</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-white hover:bg-blue-400/30 rounded-full flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {language}
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-blue-700 mb-2">{content[language].title}</h1>
              <p className="text-sm text-gray-500">{content[language].source}</p>
            </div>

            {language === 'EN' ? content.EN.content : content.TH.content}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AirQualityIndexArticle;
