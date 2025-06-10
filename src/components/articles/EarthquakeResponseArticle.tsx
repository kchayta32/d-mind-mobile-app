
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EarthquakeResponseArticle: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
        <div className="container max-w-4xl mx-auto flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white mr-3 hover:bg-blue-400/30 rounded-full"
            onClick={() => navigate('/manual')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-8 w-8 mr-3"
            />
            <div>
              <h1 className="text-xl font-bold">บทความเตือนภัย</h1>
              <p className="text-sm opacity-90">D-MIND Emergency Alert System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="container max-w-4xl mx-auto p-4">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with background image */}
          <div 
            className="h-64 bg-cover bg-center bg-gray-300 relative"
            style={{
              backgroundImage: `url('https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5K33t0GHlpONycxjrqHvHm6kPoArPPyVyaiSbN7K5XZ3mw0omYY.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">
                  20 ปี ไทยสูญเสียจาก 'ภัยพิบัติ' แค่ไหน ในวันที่โลกกำลังเผชิญกับความรุนแรงจาก 'โลกรวน'
                </h1>
                <p className="text-sm opacity-90">จาก thairath.co.th</p>
                <p className="text-sm opacity-90">10 มิถุนายน 2568</p>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6 space-y-6">
            <div className="text-center mb-8">
              <img 
                src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5K33t0GHlpONycxjrqHvHm6kPoArPPyVyaiSbN7K5XZ3mw0omYY.jpg"
                alt="วิธีรับมือแผ่นดินไหว ควรทำอย่างไร มีข้อห้ามอะไรบ้าง"
                className="w-full max-w-3xl mx-auto rounded-lg shadow-md"
              />
              <p className="text-lg font-semibold mt-4 text-gray-800">
                วิธีรับมือแผ่นดินไหว ควรทำอย่างไร มีข้อห้ามอะไรบ้าง
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <p className="text-lg leading-relaxed text-blue-800">
                ข้อปฏิบัติตัวเมื่อเกิดแผ่นดินไหวเบื้องต้น ควรทำอย่างไรให้ออกมาจากสถานที่นั้นอย่างปลอดภัย และข้อห้ามต่างๆ ที่ไม่ควรทำเพื่อความปลอดภัย
              </p>
            </div>

            <div className="prose max-w-none">
              <p className="text-lg leading-relaxed">
                แผ่นดินไหวนั้นเกิดจากการเคลื่อนตัวของเปลือกโลก เพื่อปรับความสมสมดุลของเปลือกโลกให้คงที่ (การขยาย และการคืนผิวโลก) และการสั่นสะเทือนของพื้นดิน เป็นการปลดปล่อยพลังงาน หรือแม้แต่เกิดขึ้นจากการกระทำของมนุษย์จากสิ่งปลูกสร้าง เช่น การกักเก็บน้ำจากเขื่อน การทำเหมืองแร่ หรือการทดลองระเบิดปรมาณู เป็นต้น
              </p>

              <p className="text-lg leading-relaxed">
                บ่ายวันที่ 28 มีนาคม 2568 เกิดเหตุแผ่นดินไหวขนาด 7.7 ลึก 10 กม. ที่เมียนมา รับรู้แรงสั่นสะเทือนได้หลายจังหวัดในประเทศไทย รวมถึงพื้นที่กรุงเทพมหานคร ตึกสูงใน กทม. รับรู้แรงสั่นสะเทือนได้ ซึ่งส่งผลกระทบมาถึงประเทศไทย และเป็นเวลาสำคัญในการทำงาน ทำให้ผู้ที่อยู่บนตึกสูงต่างรู้สึกตึกโยก และมีการรีบอพยพ เคลื่อนย้ายลงมาจากตึกทันทีเพื่อเฝ้าระวัง
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                วิธีรับมือแผ่นดินไหว
              </h2>

              <div className="bg-green-50 p-6 rounded-lg my-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">ตั้งสติ</h3>
                <p className="text-gray-700">
                  การมีสติเป็นเรื่องสำคัญในการรับมือกับแผ่นดินไหว มีผลต่อการเคลื่อนย้ายตนเองออกจากสถานที่นั้นๆ การมีสติจะทำให้ตนเองเคลื่อนย้ายออกมาได้อย่างปลอดภัย รวมถึงการปิดสวิตช์ไฟ แก๊ส และน้ำประปา เพื่อยับยั้งอันตรายอื่นๆ ที่จะตามมา
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg my-6">
                <h3 className="text-xl font-semibold text-yellow-800 mb-4">ออกจากอาคาร</h3>
                <p className="text-gray-700">
                  หากอยู่บนอาคาร ให้รีบเคลื่อนย้ายโดยทันที เพราะแผ่นดินไหวมีความเสี่ยงที่จะทำให้ตึก และอาคารทรุด ร้ายแรงถึงขั้นถล่มได้ ให้รีบหาประตูทางออก และหาสิ่งของที่มีลักษณะแข็งเพื่อใช้ป้องกันศีรษะ
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg my-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">หาที่กำบัง</h3>
                <p className="text-gray-700">
                  หากอยู่ในที่โล่งแจ้ง ควรหาพื้นที่กำบัง เช่น การหลบใต้อุปกรณ์ที่มีความแข็งแรง หรือหากอยู่บนตึกให้ยืนใกล้ๆ กับกำแพงตรงกลางอาคารจะปลอดภัยที่สุด และห้ามอยู่ใกล้กับหน้าต่างอาคารโดยเด็ดขาด เพราะอาจจะร้าว และแตกเสียหายได้เมื่อเกิดแผ่นดินไหว
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg my-6">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">การขับขี่</h3>
                <p className="text-gray-700">
                  ขณะขับขี่ให้ชะลอรถยนต์ ห้ามหยุดรถยนต์โดยทันที หาที่จอดข้างทางให้เป็นบริเวณโล่งแจ้ง ไม่ติดอาคาร ภูเขา และริมทะเลที่มีความเสี่ยง แล้วหาที่กำบัง
                </p>
              </div>

              <h2 className="text-2xl font-bold text-red-700 mt-8 mb-4">
                สิ่งไม่ควรทำเมื่อเกิดแผ่นดินไหว
              </h2>

              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    ห้ามใกล้จุดเสี่ยง ที่อาจจะหล่นลงมาทับได้ เช่น เสาไฟฟ้า อาคาร ภูเขา ประตู และหน้าต่าง
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    ห้ามใช้ลิฟต์
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    ห้ามขับรถยนต์ขณะเกิดแผ่นดินไหว
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    ระวังการอยู่ใกล้เขื่อน หรือชายหาด
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                วิธีปฏิบัติหลังเกิดแผ่นดินไหว
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">1.</span>
                    ตรวจสอบคนรอบข้างว่าได้รับบาดเจ็บหรือไม่
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">2.</span>
                    ตรวจเช็กท่อน้ำ สายไฟ และสายแก๊สว่ามีการชำรุดเสียหายหรือไม่ ให้มีการแก้ไขทันที เพื่อไม่ให้เกิดเหตุอื่นๆ ตามมา
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">3.</span>
                    เปิดประตู หน้าต่าง ทิ้งไว้ และออกจากพื้นที่ พร้อมแจ้งหน่วยงานที่เกี่ยวข้องทราบ
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">4.</span>
                    ติดตามข่าวสารข้อมูล และคำแนะนำเกี่ยวกับภัยพิบัติ
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">5.</span>
                    ตรวจสอบสภาพความชำรุดเสียหายของโครงสร้างอาคารบ้านเรือน และออกห่างอาคารบ้านเรือนที่ชำรุดเสียหาย
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">6.</span>
                    หากเกิดแผ่นดินไหวแล้ว ให้ใช้บันไดในการสัญจร ควรใส่รองเท้าหนังเพื่อป้องกันไม่ให้ถูกเศษหรือสิ่งของต่างๆ บาด และทำให้บาดเจ็บได้
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">7.</span>
                    บำรุง และรักษาช่องทางกู้ภัย เช่น บันไดหนีไฟ ให้มีความคล่องตัวดังเดิม
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">8.</span>
                    ทำตามคำแนะนำของเจ้าพนักงานในการหนีภัย
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">9.</span>
                    หากอยู่บริเวณท่าเรือ เขื่อน และริมทะเล ให้ออกมาจากบริเวณเหล่านี้ทันที และห้ามเข้าในเขตประสบภัยแผ่นดินไหวโดยมิได้รับอนุญาต
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">10.</span>
                    ควรระมัดระวังการลักขโมยทรัพย์สินด้วย
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">11.</span>
                    ระวังการเกิดแผ่นดินไหวซ้ำ (After shock)
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mt-8">
                <p className="text-sm text-gray-600">
                  <strong>ข้อมูล:</strong> กองเฝ้าระวังแผ่นดินไหว
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default EarthquakeResponseArticle;
