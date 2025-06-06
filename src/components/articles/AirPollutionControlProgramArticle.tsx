import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Globe } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

const AirPollutionControlProgramArticle: React.FC = () => {
  const [language, setLanguage] = useState<'TH' | 'EN'>('EN');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'TH' : 'EN');
  };

  const content = {
    EN: {
      title: "Air Pollution Control Program",
      source: "from air.moenv.gov.tw",
      content: (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg mb-8">
            <img src="/images/envi_banner.jpg" alt="Environmental Banner" className="w-full rounded-lg mb-4" />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4 flex items-center">
              <img src="/images/arrow.png" alt="" className="mr-2 h-6 w-6" />
              Air Pollution Control Program
            </h1>
            
            <h2 className="text-2xl font-semibold mb-4">Execution effects of the Air Pollution Control Program (2020-2023)</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              The statistics data shows that the percentage of days with Air Quality Index (AQI) ≦ 100 (moderate to good air quality) exceeded 93% in 2023 after factoring out the effects of dust storms, and even the number of days with AQI >150 (Unhealthy and Hazardous categories) is 0.5%.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              The concentrations of each criterion air pollutant also showed a trend of improvement year by year. The annual average concentration of PM2.5 presented by manual calibration stations is 13.7 μg/m³ in 2023, and the annual average concentration from ambient auto-monitoring stations of suspended particulates matter (PM10), ozone (O3), sulfur dioxide (SO2), and nitrogen dioxide (NO2) are 30.3 μg/m³, 30.8 ppb, 1.22 ppb, and 9.4 ppb, respectively, in 2023.
            </p>

            <div className="flex justify-center mb-8">
              <img src="/images/AirQuality/AirQuality_10_1.png" alt="Air Quality Statistics" className="max-w-full h-auto rounded-lg shadow-lg" />
            </div>

            <h3 className="text-xl font-semibold mb-4">The key achievements of the Program are as follows:</h3>
            
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  The air pollutant emissions at Taichung Power Plant are decreased from 38,000 metric tons to around 13,000 metric tons, with a reduction of 65%. The emissions at Xing-Da Power Plant decreased from 19,000 metric tons to about 6,000 metric tons, with a reduction of 68%. In addition, the pollution reduction of other government-operated enterprises, such as Chinese Petroleum Corporation, China Steel Corporation, Dragon Steel Corporation, and China Ship Building Corporation, have also continued to be implemented.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  The MOENV cooperated with the Ministry of Economic Affairs to conduct subsidies for the improvement of old boilers. In the end of 2023, a total of 7,036 industrial and non-industrial boilers had been improved.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Statistics from 2017 to 2023, 72,147 heavy-duty diesel vehicles were phased out (including replacement) in phases 1 to 3, compared with 144,000 vehicles in the previous 2016, the number of old vehicles has decreased by more than 50%. According to data, 4,050 diesel vehicles have been phased out in 2023.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  At the end of 2019, there were about 4.74 million older motorcycles. MOENV sets to replace 1.9 million older motorcycles between the periods 2020 to 2023. Statistics to 2023, a total of 2.19 million older, higher-polluting motorcycles have been retired. The achievement rate is about 115%, as well as the accumulated reduction of older motorcycles has exceeded 42%.
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Cooperate with the Ministry of Transportation and Communications (MOTC) and relevant ministries to promote the full electrification of urban buses in 2030. In 2020 to 2023, a total of 1,831 electric buses (excluding tour buses) have been approved and subsidized.
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  About 200,000 metric tons of spirit money (aka joss paper) is burned every year in Taiwan, and the promoting the centralized burning of spirit money and the subsidy to set up environmental protection spirit money burner are the main improvement measures promoted by the MOENV. The goal is to reduce the burning amount by about 10% (20,000 metric tons). In 2023, the centralized burning of spirit money and environmental friendly sacrifices are reduced the burning amount by a total of 23,000 metric tons.
                </p>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  The improvement target of small and medium-sized catering industry (cooking oil fumes) is 5,000 in 2020 to 2023. A total of 17,472 restaurants were conducted to improvement, the achievement rate is about 349%.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  In Taiwan, the application area of river bare land control measures is about 2,000 hectares annually. From May 2022 to April 2023, the area under control was 2,035 hectares, and the annual target was achieved. Up to now, from May to December 2023, about 1,712 hectares of bare river land have been controlled.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Air quality management measures - Air Pollution Control Program (2024-2027)</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              The "Air Pollution Control Program (2024-2027)" (referred to as the phase 2 program) continues the efforts of the Air Pollution Control Program (2020-2023) (referred to as the phase 1 program) to further improve PM2.5 and O3-8hr air quality. The phase 2 program focuses on precise management of regional and seasonal air quality issues while aligning with the 2050 net-zero policy to enhance co-benefits in pollution and carbon reduction. The phase 2 program aims to improve the national annual average concentration of PM2.5 to 13.0 μg/m³ by 2027 and to decrease the number of AQI>150 O3-8hr station-days by 80% compared to the baseline year 2019.
            </p>

            <h3 className="text-xl font-semibold mb-4">The phase 2 program outlines eight key aspects of the control strategies, as follows:</h3>

            <div className="space-y-4">
              {[
                {
                  title: "Aspect (1) - Advancing Industry Emission Reduction Techniques:",
                  content: "This includes providing technical guidance, encouraging the adoption of green production methods, and proposing revisions to emission standards across six specific industries to reduce NOX, VOCs, and manage haps emissions."
                },
                {
                  title: "Aspect (2) - Comprehensive management of vehicles and equipment:",
                  content: "Strengthening the inspection and maintenance system for in-use vehicles and engine management, while encouraging the replacement of old vehicles with cleaner alternatives. This strategy aims to retire 3,700 old diesel (stage 1-3) vehicles and issue 68,000 self-management labels for large diesel vehicle fleets."
                },
                {
                  title: "Aspect (3) - Establishing cross-ministry project management:",
                  content: "Implementing collaborative management across agencies for five major pollution sources, including: managing folk activities (reducing joss paper burning by 12,000 tons), managing port area vessels (increasing shore power usage to 90% and enhancing road cleaning in port areas to cover 10,000 kilometers), controlling fugitive emissions from construction sites (promoting intelligent monitoring at 50 sites), managing agricultural activities (strengthening inspections of open burning and reducing chemical fertilizer use by 80,000 tons), and controlling river dust (improving 9,200 hectares of bare land)."
                },
                {
                  title: "Aspect (4) - Air pollution management for major development projects in key region:",
                  content: "In response to industrial development planning, overseeing pollution emissions and offsets, tracking the progress of five key pollution reduction projects in central and southern Taiwan, promoting the designation of air quality maintenance areas, and reducing regional air pollution emissions."
                },
                {
                  title: "Aspect (5) - Season-specific strengthened response:",
                  content: "Strengthening emergency response capabilities during poor air quality season by improving early warning and forecasting systems, and intensifying pollution control measures during these times."
                },
                {
                  title: "Aspect (6) - Achieving net zero and pollution reduction by 2050:",
                  content: "Supporting Taiwan's energy transition and electrification of transportation policies by promoting clean energy development and increasing the number of electric vehicles to achieve co-benefits in both carbon and pollution reduction."
                },
                {
                  title: "Aspect (7) - Emission reduction by economic incentives:",
                  content: "Encouraging industries to reduce emissions by adjusting the air pollution fee."
                },
                {
                  title: "Aspect (8) - Comprehensive management and support:",
                  content: "Developing key air pollution research and technologies and continuously cultivating environmental sustainability education."
                }
              ].map((aspect, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-700 mb-2">{aspect.title}</h4>
                  <p className="text-gray-700">{aspect.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    TH: {
      title: "โครงการควบคุมมลพิษอากาศ",
      source: "จาก air.moenv.gov.tw",
      content: (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg mb-8">
            <img src="/images/envi_banner.jpg" alt="Environmental Banner" className="w-full rounded-lg mb-4" />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4 flex items-center">
              <img src="/images/arrow.png" alt="" className="mr-2 h-6 w-6" />
              โครงการควบคุมมลพิษอากาศ
            </h1>
            
            <h2 className="text-2xl font-semibold mb-4">ผลการดำเนินงานของโครงการควบคุมมลพิษอากาศ (พ.ศ. 2563-2566)</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              ข้อมูลสถิติแสดงให้เห็นว่าเปอร์เซ็นต์ของวันที่ดัชนีคุณภาพอากาศ (AQI) ≦ 100 (คุณภาพอากาศปานกลางถึงดี) เกิน 93% ในปี 2566 หลังจากหักผลกระทบจากพายุฝุ่น และจำนวนวันที่ AQI >150 (ประเภทที่ไม่ดีต่อสุขภาพและเป็นอันตราย) คือ 0.5%
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              ความเข้มข้นของสารมลพิษทางอากาศที่เป็นเกณฑ์แต่ละรายการยังแสดงแนวโน้มการปรับปรุงขึ้นทุกปี ค่าเฉลี่ยรายปีของ PM2.5 ที่นำเสนอโดยสถานีสอบเทียบด้วยตนเองคือ 13.7 μg/m³ ในปี 2566 และค่าเฉลี่ยรายปีจากสถานีตรวจวัดอัตโนมัติในบรรยากาศของสารแขวนลอย (PM10), โอโซน (O3), ซัลเฟอร์ไดออกไซด์ (SO2) และไนโตรเจนไดออกไซด์ (NO2) คือ 30.3 μg/m³, 30.8 ppb, 1.22 ppb และ 9.4 ppb ตามลำดับ ในปี 2566
            </p>

            <div className="flex justify-center mb-8">
              <img src="/images/AirQuality/AirQuality_10_1.png" alt="สถิติคุณภาพอากาศ" className="max-w-full h-auto rounded-lg shadow-lg" />
            </div>

            <h3 className="text-xl font-semibold mb-4">ความสำเร็จที่สำคัญของโครงการมีดังนี้:</h3>
            
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  การปล่อยสารมลพิษทางอากาศที่โรงไฟฟ้าไทจงลดลงจาก 38,000 เมตริกตันเหลือประมาณ 13,000 เมตริกตัน ลดลง 65% การปล่อยมลพิษที่โรงไฟฟ้าซิงต้าลดลงจาก 19,000 เมตริกตันเหลือประมาณ 6,000 เมตริกตัน ลดลง 68% นอกจากนี้ การลดมลพิษของรัฐวิสาหกิจอื่นๆ เช่น บริษัทปิโตรเลียมแห่งประเทศจีน บริษัทเหล็กกล้าแห่งประเทศจีน บริษัทเหล็กกล้ามังกร และบริษัทต่อเรือแห่งประเทศจีน ก็ยังคงดำเนินการอย่างต่อเนื่อง
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  MOENV ร่วมมือกับกระทรวงเศรษฐกิจในการให้เงินอุดหนุนสำหรับการปรับปรุงหม้อไอน้ำเก่า ณ สิ้นปี 2566 มีการปรับปรุงหม้อไอน้ำอุตสาหกรรมและที่ไม่ใช่อุตสาหกรรมรวม 7,036 เครื่อง
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  สถิติจากปี 2560 ถึง 2566 รถบรรทุกดีเซลขนาดหนัก 72,147 คันถูกทยอยเลิกใช้งาน (รวมถึงการเปลี่ยน) ในระยะที่ 1 ถึง 3 เมื่อเทียบกับรถ 144,000 คันในปี 2559 จำนวนรถเก่าลดลงมากกว่า 50% จากข้อมูล รถดีเซล 4,050 คันถูกเลิกใช้งานในปี 2566
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  ณ สิ้นปี 2562 มีรถจักรยานยนต์เก่าประมาณ 4.74 ล้านคัน MOENV ตั้งเป้าที่จะเปลี่ยนรถจักรยานยนต์เก่า 1.9 ล้านคันระหว่างปี 2563 ถึง 2566 สถิติถึงปี 2566 รถจักรยานยนต์เก่าที่ก่อมลพิษสูงจำนวน 2.19 ล้านคันถูกปลดประจำการ อัตราความสำเร็จอยู่ที่ประมาณ 115% และการลดจำนวนรถจักรยานยนต์เก่าสะสมเกิน 42%
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  ร่วมมือกับกระทรวงคมนาคม (MOTC) และกระทรวงที่เกี่ยวข้องเพื่อส่งเสริมการใช้พลังงานไฟฟ้าเต็มรูปแบบของรถโดยสารประจำทางในเมืองในปี 2573 ในปี 2563 ถึง 2566 รถโดยสารไฟฟ้า (ไม่รวมรถโดยสารท่องเที่ยว) จำนวน 1,831 คันได้รับการอนุมัติและให้เงินอุดหนุน
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  มีการเผากระดาษเงิน (aka joss paper) ประมาณ 200,000 เมตริกตันทุกปีในไต้หวัน และการส่งเสริมการเผากระดาษเงินแบบรวมศูนย์และการอุดหนุนเพื่อจัดตั้งเตาเผากระดาษเงินที่เป็นมิตรต่อสิ่งแวดล้อมเป็นมาตรการปรับปรุงหลักที่ส่งเสริมโดย MOENV เป้าหมายคือลดปริมาณการเผาไหม้ลงประมาณ 10% (20,000 เมตริกตัน) ในปี 2566 การเผากระดาษเงินแบบรวมศูนย์และการบูชาที่เป็นมิตรต่อสิ่งแวดล้อมช่วยลดปริมาณการเผาไหม้ลงทั้งหมด 23,000 เมตริกตัน
                </p>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  เป้าหมายการปรับปรุงของอุตสาหกรรมจัดเลี้ยงขนาดเล็กและขนาดกลาง (ควันน้ำมันจากการปรุงอาหาร) คือ 5,000 ในปี 2563 ถึง 2566 มีการดำเนินการปรับปรุงร้านอาหารทั้งหมด 17,472 แห่ง อัตราความสำเร็จอยู่ที่ประมาณ 349%
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  ในไต้หวัน พื้นที่การใช้มาตรการควบคุมที่ดินเปล่าริมแม่น้ำอยู่ที่ประมาณ 2,000 เฮกตาร์ต่อปี ตั้งแต่เดือนพฤษภาคม 2565 ถึงเมษายน 2566 พื้นที่ภายใต้การควบคุมคือ 2,035 เฮกตาร์ และบรรลุเป้าหมายประจำปี จนถึงขณะนี้ ตั้งแต่เดือนพฤษภาคมถึงธันวาคม 2566 มีการควบคุมที่ดินเปล่าริมแม่น้ำประมาณ 1,712 เฮกตาร์
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">มาตรการจัดการคุณภาพอากาศ - โครงการควบคุมมลพิษทางอากาศ (พ.ศ. 2567-2570)</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              "โครงการควบคุมมลพิษทางอากาศ (พ.ศ. 2567-2570)" (เรียกว่าโครงการระยะที่ 2) ยังคงสานต่อความพยายามของโครงการควบคุมมลพิษทางอากาศ (พ.ศ. 2563-2566) (เรียกว่าโครงการระยะที่ 1) เพื่อปรับปรุงคุณภาพอากาศ PM2.5 และ O3-8hr ให้ดียิ่งขึ้น โครงการระยะที่ 2 มุ่งเน้นไปที่การจัดการที่แม่นยำของปัญหาคุณภาพอากาศระดับภูมิภาคและตามฤดูกาล ในขณะที่สอดคล้องกับนโยบาย Net-Zero ปี 2593 เพื่อเพิ่มผลประโยชน์ร่วมในการลดมลพิษและการลดคาร์บอน โครงการระยะที่ 2 มีเป้าหมายที่จะปรับปรุงค่าเฉลี่ยรายปีของประเทศของ PM2.5 เป็น 13.0 μg/m³ ภายในปี 2570 และลดจำนวนสถานี O3-8hr ที่มี AQI>150 ลง 80% เมื่อเทียบกับปีฐาน 2562
            </p>

            <h3 className="text-xl font-semibold mb-4">โครงการระยะที่ 2 สรุปประเด็นสำคัญ 8 ประการของกลยุทธ์การควบคุมดังนี้:</h3>

            <div className="space-y-4">
              {[
                {
                  title: "ด้านที่ (1) - การพัฒนาเทคนิคการลดการปล่อยมลพิษในอุตสาหกรรม:",
                  content: "ซึ่งรวมถึงการให้คำแนะนำทางเทคนิค การส่งเสริมการนำวิธีการผลิตที่เป็นมิตรต่อสิ่งแวดล้อมมาใช้ และการเสนอการแก้ไขมาตรฐานการปล่อยมลพิษในหกอุตสาหกรรมเฉพาะเพื่อลด NOX, VOC และจัดการการปล่อย HAP"
                },
                {
                  title: "ด้านที่ (2) - การจัดการยานพาหนะและอุปกรณ์อย่างครอบคลุม:",
                  content: "การเสริมสร้างระบบการตรวจสอบและบำรุงรักษายานพาหนะที่ใช้งานและระบบการจัดการเครื่องยนต์ ในขณะที่ส่งเสริมการเปลี่ยนยานพาหนะเก่าด้วยทางเลือกที่สะอาดกว่า กลยุทธ์นี้มีเป้าหมายที่จะปลดประจำการรถดีเซลเก่า (ระยะที่ 1-3) จำนวน 3,700 คัน และออกฉลากการจัดการตนเองจำนวน 68,000 ฉลากสำหรับกลุ่มรถดีเซลขนาดใหญ่"
                },
                {
                  title: "ด้านที่ (3) - การจัดตั้งการจัดการโครงการข้ามกระทรวง:",
                  content: "การดำเนินการจัดการร่วมกันระหว่างหน่วยงานสำหรับแหล่งกำเนิดมลพิษหลัก 5 แห่ง ได้แก่ การจัดการกิจกรรมพื้นบ้าน (ลดการเผากระดาษเงิน 12,000 ตัน) การจัดการเรือในพื้นที่ท่าเรือ (เพิ่มการใช้พลังงานจากชายฝั่งเป็น 90% และเพิ่มการทำความสะอาดถนนในพื้นที่ท่าเรือให้ครอบคลุม 10,000 กิโลเมตร) การควบคุมการปล่อยมลพิษแบบฟุ้งกระจายจากสถานที่ก่อสร้าง (ส่งเสริมการตรวจสอบอัจฉริยะใน 50 แห่ง) การจัดการกิจกรรมทางการเกษตร (เสริมสร้างการตรวจสอบการเผาในที่โล่งและการลดการใช้ปุ๋ยเคมีลง 80,000 ตัน) และการควบคุมฝุ่นจากแม่น้ำ (ปรับปรุงที่ดินเปล่า 9,200 เฮกตาร์)"
                },
                {
                  title: "ด้านที่ (4) - การจัดการมลพิษทางอากาศสำหรับโครงการพัฒนาที่สำคัญในภูมิภาคหลัก:",
                  content: "เพื่อตอบสนองต่อการวางแผนการพัฒนาอุตสาหกรรม การกำกับดูแลการปล่อยมลพิษและการชดเชย การติดตามความคืบหน้าของโครงการลดมลพิษที่สำคัญ 5 โครงการในภาคกลางและภาคใต้ของไต้หวัน การส่งเสริมการกำหนดพื้นที่บำรุงรักษาคุณภาพอากาศ และการลดการปล่อยมลพิษทางอากาศในระดับภูมิภาค"
                },
                {
                  title: "ด้านที่ (5) - การตอบสนองที่เข้มแข็งขึ้นตามฤดูกาล:",
                  content: "การเสริมสร้างขีดความสามารถในการตอบสนองต่อเหตุฉุกเฉินในช่วงฤดูคุณภาพอากาศไม่ดีโดยการปรับปรุงระบบเตือนภัยล่วงหน้าและการพยากรณ์ และการเพิ่มความเข้มข้นของมาตรการควบคุมมลพิษในช่วงเวลาเหล่านี้"
                },
                {
                  title: "ด้านที่ (6) - การบรรลุ Net-Zero และการลดมลพิษภายในปี 2593:",
                  content: "การสนับสนุนการเปลี่ยนผ่านด้านพลังงานของไต้หวันและนโยบายการใช้พลังงานไฟฟ้าในการขนส่งโดยการส่งเสริมการพัฒนาพลังงานสะอาดและการเพิ่มจำนวนรถยนต์ไฟฟ้าเพื่อให้บรรลุผลประโยชน์ร่วมกันทั้งในการลดคาร์บอนและการลดมลพิษ"
                },
                {
                  title: "ด้านที่ (7) - การลดการปล่อยมลพิษโดยใช้แรงจูงใจทางเศรษฐกิจ:",
                  content: "การส่งเสริมให้อุตสาหกรรมลดการปล่อยมลพิษโดยการปรับค่าธรรมเนียมมลพิษทางอากาศ"
                },
                {
                  title: "ด้านที่ (8) - การจัดการและการสนับสนุนที่ครอบคลุม:",
                  content: "การพัฒนาเทคโนโลยีและการวิจัยมลพิษทางอากาศที่สำคัญ และการปลูกฝังการศึกษาด้านความยั่งยืนด้านสิ่งแวดล้อมอย่างต่อเนื่อง"
                }
              ].map((aspect, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-700 mb-2">{aspect.title}</h4>
                  <p className="text-gray-700">{aspect.content}</p>
                </div>
              ))}
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

export default AirPollutionControlProgramArticle;
