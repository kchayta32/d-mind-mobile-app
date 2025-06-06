
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Globe } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

const AirQualityIndexArticle: React.FC = () => {
  const [language, setLanguage] = useState<'TH' | 'EN'>('EN');
  const [activeTab, setActiveTab] = useState<'PM25' | 'PM10' | 'SO2' | 'NOX' | 'CO' | 'O3'>('PM25');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'TH' : 'EN');
  };

  const pollutantData = {
    PM25: {
      EN: {
        title: 'PM₂.₅',
        description: 'Construction site, transboundary, industry, open burning or Traffic caused pollution(surface aeolian dust or motor vehicle pollution)'
      },
      TH: {
        title: 'PM₂.₅',
        description: 'มลพิษจากการก่อสร้าง อุตสาหกรรม การเผาไหม้ หรือการจราจร (ฝุ่นละอองจากพื้นผิวหรือยานพาหนะ)'
      }
    },
    PM10: {
      EN: {
        title: 'PM₁₀',
        description: 'Construction site, transboundary, industry, open burning or Traffic caused pollution(surface aeolian dust or motor vehicle pollution)'
      },
      TH: {
        title: 'PM₁₀',
        description: 'มลพิษจากการก่อสร้าง อุตสาหกรรม การเผาไหม้ หรือการจราจร (ฝุ่นละอองจากพื้นผิวหรือยานพาหนะ)'
      }
    },
    SO2: {
      EN: {
        title: 'SO₂',
        description: 'Volcanic gas or sulfufric burning in fossil fuel'
      },
      TH: {
        title: 'SO₂',
        description: 'ก๊าซจากภูเขาไฟหรือการเผาไหม้เชื้อเพลิงฟอสซิลที่มีกำมะถัน'
      }
    },
    NOX: {
      EN: {
        title: 'NOₓ',
        description: 'Nitrogen Oxide is formed during the process of nitride combustion. Nitride is the product of nitrogen oxide photochemical reaction.'
      },
      TH: {
        title: 'NOₓ',
        description: 'ไนโตรเจนออกไซด์เกิดขึ้นจากกระบวนการเผาไหม้ เป็นผลิตภัณฑ์จากปฏิกิริยาเคมีแสงของไนโตรเจนออกไซด์'
      }
    },
    CO: {
      EN: {
        title: 'CO',
        description: 'Forest fire, methane nitridation, biological activity or incomplete combustion of fuel.'
      },
      TH: {
        title: 'CO',
        description: 'จากไฟป่า การเผาไหม้มีเทนที่ไม่สมบูรณ์ กิจกรรมทางชีวภาพ หรือการเผาไหม้เชื้อเพลิงที่ไม่สมบูรณ์'
      }
    },
    O3: {
      EN: {
        title: 'O₃',
        description: 'Secondary pollutants from nitrogen oxide, reactive hydrocarbons, or photochemical reaction.'
      },
      TH: {
        title: 'O₃',
        description: 'สารมลพิษทุติยภูมิจากไนโตรเจนออกไซด์ สารไฮโดรคาร์บอนที่ว่องไว หรือปฏิกิริยาเคมีแสง'
      }
    }
  };

  const content = {
    EN: {
      title: "Air Quality Index",
      source: "from airtw.moenv.gov.tw",
      content: (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Air Quality Index</h1>
            <h2 className="text-2xl font-semibold mb-4">The definition of air pollution indicators</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Air quality index based on monitoring data will be on the same day in the air ozone(O₃), fine particulate matter(PM₂.₅), particulate matter(PM₁₀), carbon monoxide(CO), sulfur dioxide(SO₂) and II Nitric oxide(NO₂) such as the concentration of value, its impact on human health, were converted into different pollutants The vice-value targets, indicators, deputy to the day of the maximum value of the stations on the day of the air quality index (AQI).
            </p>

            <ul className="space-y-2 mb-8">
              <li><a href="#tg1" className="text-blue-600 hover:underline font-semibold">Introduction to air pollutants</a></li>
              <li><a href="#tg2" className="text-blue-600 hover:underline font-semibold">Daily air quality indicator <span className="text-sm">(Daily AQI)</span></a></li>
              <li><a href="#tg3" className="text-blue-600 hover:underline font-semibold">Real-time air quality indicator <span className="text-sm">(real-time AQI)</span></a></li>
              <li><a href="#tg4" className="text-blue-600 hover:underline font-semibold">AQI value and impact on health</a></li>
            </ul>
          </div>

          <div id="tg1">
            <h3 className="text-xl font-semibold mb-4">Introduction to air pollutants</h3>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(pollutantData).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`px-4 py-2 rounded-lg border ${
                      activeTab === key 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pollutantData[key as keyof typeof pollutantData].EN.title}
                  </button>
                ))}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">● {pollutantData[activeTab].EN.title}</h4>
                <p className="text-gray-700">{pollutantData[activeTab].EN.description}</p>
              </div>
            </div>
          </div>

          <div id="tg2">
            <h3 className="text-xl font-semibold mb-4">Daily air quality indicator (Daily AQI)</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Concentrations of ozone (O₃), fine particulate matter (PM₂.₅), particulate matter (PM₁₀), carbon monoxide (CO), sulfur dioxide (SO₂) and nitrogen dioxide (NO₂) in a day are converted into their corresponding sub-indicators based on their impacts on human health. The largest value of the sub-indicators is the AQI of the monitoring station on the day.
            </p>

            <div className="overflow-x-auto">
              <h4 className="text-lg font-semibold mb-4 text-center">Air Quality Index (AQI)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-green-100 rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div>
                    <div className="font-semibold">Good</div>
                    <div className="text-sm">0-50</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-100 rounded-lg">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <div>
                    <div className="font-semibold">Moderate</div>
                    <div className="text-sm">51-100</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <div>
                    <div className="font-semibold">Unhealthy for Sensitive Groups</div>
                    <div className="text-sm">101-150</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-red-100 rounded-lg">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <div>
                    <div className="font-semibold">Unhealthy</div>
                    <div className="text-sm">151-200</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-100 rounded-lg">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <div>
                    <div className="font-semibold">Very Unhealthy</div>
                    <div className="text-sm">201-300</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-red-200 rounded-lg">
                  <div className="w-4 h-4 bg-red-900 rounded"></div>
                  <div>
                    <div className="font-semibold">Hazardous</div>
                    <div className="text-sm">301-500</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Notes:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Areas are generally required to report the AQI based on 8-hour ozone values. However, there are a small number of areas where an AQI based on 1-hour ozone values would be more precautionary.</li>
                  <li>8-hour O₃ values do not define higher AQI values (≥ 301). AQI values of 301 or higher are calculated with 1-hour O₃ concentrations.</li>
                  <li>1-hour SO₂ values do not define higher AQI values (≥ 200). AQI values of 200 or greater are calculated with 24-hour SO₂ concentrations.</li>
                </ol>
              </div>
            </div>
          </div>

          <div id="tg3">
            <h3 className="text-xl font-semibold mb-4">Real-time air quality indicator (real-time AQI)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The MOENV issues real-time AQI as a reference for issuing early warnings and provides hourly monitoring data. The calculation of real-time AQI is the following:
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              The real-time concentration of each item is calculated based on the following equations, and compared against the following table to obtain the real-time sub-indicators of O₃, PM₂.₅, PM₁₀, CO, SO₂ and NO₂. The largest sub-indicator is the real-time AQI, and its corresponding item is the leading pollutant.
            </p>

            <ul className="space-y-2 mb-6 text-sm">
              <li><strong>● O₃, 8h:</strong> value of the last 8-hour moving average (e.g. the 8-hour average concentration value of O₃ published at 10AM this morning is the average of monitoring data from 2AM to 9AM this morning)</li>
              <li><strong>● O₃:</strong> real-time concentration value</li>
              <li><strong>● PM₂.₅:</strong> 0.5 x average of the first 12 hours + 0.5 x average of the first 4 hours (2 entries of the first 4 hours are valid and 6 entries of the first 12 hours are valid)</li>
              <li><strong>● PM₁₀:</strong> 0.5 x average of the first 12 hours + 0.5 x average of the first 4 hours (2 entries of the first 4 hours are valid and 6 entries of the first 12 hours are valid)</li>
              <li><strong>● CO:</strong> value of the last 8-hour moving average (e.g. the 8-hour average concentration value of CO published at 10AM this morning is the average of monitoring data from 2AM to 9AM this morning)</li>
              <li><strong>● SO₂:</strong> real-time concentration value</li>
              <li><strong>● SO₂, 24h:</strong> average of concentration values in the last 24 hours (e.g. the 24-hour average concentration value of SO₂ published at 10AM this morning is the average of monitoring data from 10AM yesterday to 9AM today)</li>
              <li><strong>● NO₂:</strong> real-time concentration value</li>
            </ul>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm"><strong>Note:</strong> A valid moving average of PM₂.₅ includes the first digit to the right of the decimal point, so the second digit to the right of the decimal point is rounded. Valid 8-hour moving average of O₃ and moving average of PM₁₀ should be integers, so the first digit to the right of the decimal point is rounded.</p>
            </div>

            <div className="overflow-x-auto mb-6">
              <h4 className="text-lg font-semibold mb-4 text-center">The concentration of pollutants and air quality index value deputy table</h4>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>AQI</TableHead>
                    <TableHead>0-50</TableHead>
                    <TableHead>51-100</TableHead>
                    <TableHead>101-150</TableHead>
                    <TableHead>151-200</TableHead>
                    <TableHead>201-300</TableHead>
                    <TableHead>301-400</TableHead>
                    <TableHead>401-500</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">O₃, 8h (ppm)</TableCell>
                    <TableCell>0.000-0.054</TableCell>
                    <TableCell>0.055-0.070</TableCell>
                    <TableCell>0.071-0.085</TableCell>
                    <TableCell>0.086-0.105</TableCell>
                    <TableCell>0.106-0.200</TableCell>
                    <TableCell className="text-red-600">(2)</TableCell>
                    <TableCell className="text-red-600">(2)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">O₃ (ppm)</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-red-600">0.101-0.134</TableCell>
                    <TableCell className="text-red-600">0.135-0.204</TableCell>
                    <TableCell>0.205-0.404</TableCell>
                    <TableCell>0.405-0.504</TableCell>
                    <TableCell>0.505-0.604</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">PM₂.₅ (μg/m³)</TableCell>
                    <TableCell className="text-red-600">0.0-12.4</TableCell>
                    <TableCell className="text-red-600">12.5-30.4</TableCell>
                    <TableCell className="text-red-600">30.5-50.4</TableCell>
                    <TableCell className="text-red-600">50.5-125.4</TableCell>
                    <TableCell className="text-red-600">125.5-225.4</TableCell>
                    <TableCell className="text-red-600">225.5-325.4</TableCell>
                    <TableCell className="text-red-600">325.5-500.4</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">PM₁₀ (μg/m³)</TableCell>
                    <TableCell className="text-red-600">0-30</TableCell>
                    <TableCell className="text-red-600">31-75</TableCell>
                    <TableCell className="text-red-600">76-190</TableCell>
                    <TableCell className="text-red-600">191-354</TableCell>
                    <TableCell>355-424</TableCell>
                    <TableCell>425-504</TableCell>
                    <TableCell>505-604</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>Areas are generally required to report the AQI based on 8-hour ozone values. However, there are a small number of areas where an AQI based on 1-hour ozone values would be more precautionary. In these cases, in addition to calculating the 8-hour ozone index value, the 1-hour ozone value may be calculated, and the maximum of the two values reported.</li>
                <li>8-hour O₃ values do not define higher AQI values (≥ 301). AQI values of 301 or higher are calculated with 1-hour O₃ concentrations.</li>
                <li>1-hour SO₂ values do not define higher AQI values (≥ 200). AQI values of 200 or greater are calculated with 24-hour SO₂ concentrations.</li>
              </ol>
            </div>
          </div>

          <div id="tg4">
            <h3 className="text-xl font-semibold mb-4">Air Quality Index and Activity Guidance</h3>
            
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>AQI</TableHead>
                    <TableHead>0-50</TableHead>
                    <TableHead>51-100</TableHead>
                    <TableHead>101-150</TableHead>
                    <TableHead>151-200</TableHead>
                    <TableHead>201-300</TableHead>
                    <TableHead>301-500</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Air Quality Index Levels of Health Concern</TableCell>
                    <TableCell>Good</TableCell>
                    <TableCell>Moderate</TableCell>
                    <TableCell>Unhealthy for Sensitive Groups</TableCell>
                    <TableCell>Unhealthy</TableCell>
                    <TableCell>Very Unhealthy</TableCell>
                    <TableCell>Hazardous</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Status Color</TableCell>
                    <TableCell className="bg-green-100"><strong>Green</strong></TableCell>
                    <TableCell className="bg-yellow-100"><strong>Yellow</strong></TableCell>
                    <TableCell className="bg-orange-100"><strong>Orange</strong></TableCell>
                    <TableCell className="bg-red-100"><strong>Red</strong></TableCell>
                    <TableCell className="bg-purple-100"><strong>Purple</strong></TableCell>
                    <TableCell className="bg-red-200"><strong>Maroon</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Impact on Human Health</TableCell>
                    <TableCell>Air quality is considered satisfactory, and air pollution poses little or no risk.</TableCell>
                    <TableCell>Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.</TableCell>
                    <TableCell>Members of sensitive groups may experience health effects. The general public is not likely to be affected.</TableCell>
                    <TableCell>Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.</TableCell>
                    <TableCell>Health alert: everyone may experience more serious health effects.</TableCell>
                    <TableCell>Health warnings of emergency conditions. The entire population is more likely to be affected.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Activity Guidance for the General Public</TableCell>
                    <TableCell>Enjoy your usual outdoor activities.</TableCell>
                    <TableCell>Enjoy your usual outdoor activities.</TableCell>
                    <TableCell>1. Everyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing outdoor activities.<br/>2. For students, it's ok to be active outside, but are recommended to reduce prolonged strenuous exercise.</TableCell>
                    <TableCell>1. Everyone experiencing discomfort such as sore eyes, cough or sore throat should reduce physical exertion, particularly outdoors.<br/>2. Students should avoid prolonged strenuous exercise, and take more breaks during outdoor activities.</TableCell>
                    <TableCell>1. Everyone should reduce outdoor activities.<br/>2. Students should stop outdoor activities and move all activities and classes indoors.</TableCell>
                    <TableCell>1. Everyone should avoid outdoor activities and keep doors and windows closed. If it is necessary to go out, please wear a mask.<br/>2. Students should stop outdoor activities and move all activities and classes indoors.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Activity Guidance for Sensitive Groups</TableCell>
                    <TableCell>Enjoy your usual outdoor activities.</TableCell>
                    <TableCell>Unusually sensitive groups are recommended to watch for symptoms such as coughing or shortness of breath, but can still be active outside.</TableCell>
                    <TableCell>1. People with heart, respiratory and cardiovascular problems, children, teenagers and older adults are recommended to reduce physical exertion and outdoor activities.<br/>2. People with asthma may need to use their reliever inhalers more often.</TableCell>
                    <TableCell>1. People with heart, respiratory and cardiovascular problems, children, teenagers and older adults are recommended to stay indoors and reduce physical exertion. If it is necessary to go out, please wear a mask.<br/>2. People with asthma may need to use their reliever inhalers more often.</TableCell>
                    <TableCell>1. People with heart, respiratory and cardiovascular problems, children, teenagers and older adults should stay indoors and reduce physical exertion. If it is necessary to go out, please wear a mask.<br/>2. People with asthma should use their reliever inhalers more often.</TableCell>
                    <TableCell>1. People with heart, respiratory and cardiovascular problems, children, teenagers and older adults should stay indoors and avoid physical exertion. If it is necessary to go out, please wear a mask.<br/>2. People with asthma should use their reliever inhalers more often.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )
    },
    TH: {
      title: "ดัชนีคุณภาพอากาศ",
      source: "จาก airtw.moenv.gov.tw",
      content: (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">ดัชนีคุณภาพอากาศ</h1>
            <h2 className="text-2xl font-semibold mb-4">คำนิยามของตัวบ่งชี้มลพิษทางอากาศ</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              ดัชนีคุณภาพอากาศจากข้อมูลการตรวจวัดจะอิงจากค่าความเข้มข้นของโอโซน (O₃), ฝุ่นละอองขนาดเล็ก (PM₂.₅), ฝุ่นละออง (PM₁₀), คาร์บอนมอนอกไซด์ (CO), ซัลเฟอร์ไดออกไซด์ (SO₂) และไนโตรเจนไดออกไซด์ (NO₂) ในวันเดียวกัน โดยแปลงผลกระทบต่อสุขภาพมนุษย์เป็นค่าตัวบ่งชี้ย่อยต่างๆ และใช้ค่าสูงสุดเป็นดัชนีคุณภาพอากาศ (AQI) ของสถานีในวันนั้น
            </p>

            <ul className="space-y-2 mb-8">
              <li><a href="#tg1" className="text-blue-600 hover:underline font-semibold">ข้อมูลสารมลพิษทางอากาศ</a></li>
              <li><a href="#tg2" className="text-blue-600 hover:underline font-semibold">ตัวบ่งชี้คุณภาพอากาศรายวัน <span className="text-sm">(Daily AQI)</span></a></li>
              <li><a href="#tg3" className="text-blue-600 hover:underline font-semibold">ตัวบ่งชี้คุณภาพอากาศแบบเรียลไทม์ <span className="text-sm">(real-time AQI)</span></a></li>
              <li><a href="#tg4" className="text-blue-600 hover:underline font-semibold">ค่า AQI และผลกระทบต่อสุขภาพ</a></li>
            </ul>
          </div>

          <div id="tg1">
            <h3 className="text-xl font-semibold mb-4">ข้อมูลสารมลพิษทางอากาศ</h3>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(pollutantData).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`px-4 py-2 rounded-lg border ${
                      activeTab === key 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pollutantData[key as keyof typeof pollutantData].TH.title}
                  </button>
                ))}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">● {pollutantData[activeTab].TH.title}</h4>
                <p className="text-gray-700">{pollutantData[activeTab].TH.description}</p>
              </div>
            </div>
          </div>

          <div id="tg2">
            <h3 className="text-xl font-semibold mb-4">ตัวบ่งชี้คุณภาพอากาศรายวัน (Daily AQI)</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              ค่าความเข้มข้นของโอโซน (O₃), ฝุ่นละอองขนาดเล็ก (PM₂.₅), ฝุ่นละออง (PM₁₀), คาร์บอนมอนอกไซด์ (CO), ซัลเฟอร์ไดออกไซด์ (SO₂) และไนโตรเจนไดออกไซด์ (NO₂) ในหนึ่งวันจะถูกแปลงเป็นตัวบ่งชี้ย่อยที่สอดคล้องกันตามผลกระทบต่อสุขภาพมนุษย์ ค่าสูงสุดของตัวบ่งชี้ย่อยคือ AQI ของสถานีตรวจวัดในวันนั้น
            </p>

            <div className="overflow-x-auto">
              <h4 className="text-lg font-semibold mb-4 text-center">ดัชนีคุณภาพอากาศ (AQI)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-green-100 rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div>
                    <div className="font-semibold">ดี</div>
                    <div className="text-sm">0-50</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-100 rounded-lg">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <div>
                    <div className="font-semibold">ปานกลาง</div>
                    <div className="text-sm">51-100</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <div>
                    <div className="font-semibold">ไม่ดีต่อกลุ่มเสี่ยง</div>
                    <div className="text-sm">101-150</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-red-100 rounded-lg">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <div>
                    <div className="font-semibold">ไม่ดีต่อสุขภาพ</div>
                    <div className="text-sm">151-200</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-100 rounded-lg">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <div>
                    <div className="font-semibold">อันตรายมาก</div>
                    <div className="text-sm">201-300</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-red-200 rounded-lg">
                  <div className="w-4 h-4 bg-red-900 rounded"></div>
                  <div>
                    <div className="font-semibold">อันตรายอย่างมาก</div>
                    <div className="text-sm">301-500</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>หมายเหตุ:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>พื้นที่ส่วนใหญ่จำเป็นต้องรายงาน AQI ตามค่าโอโซน 8 ชั่วโมง อย่างไรก็ตาม มีพื้นที่เล็กๆ จำนวนหนึ่งที่ AQI ตามค่าโอโซน 1 ชั่วโมงจะระมัดระวังมากกว่า</li>
                  <li>ค่าโอโซน 8 ชั่วโมงไม่กำหนดค่า AQI ที่สูงกว่า (≥ 301) ค่า AQI 301 หรือสูงกว่าคำนวณด้วยความเข้มข้นโอโซน 1 ชั่วโมง</li>
                  <li>ค่า SO₂ 1 ชั่วโมงไม่กำหนดค่า AQI ที่สูงกว่า (≥ 200) ค่า AQI 200 หรือสูงกว่าคำนวณด้วยความเข้มข้น SO₂ 24 ชั่วโมง</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
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

            {content[language].content}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AirQualityIndexArticle;
