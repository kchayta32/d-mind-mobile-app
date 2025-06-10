
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const EarthquakeResponseArticle: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 shadow-lg">
        <div className="container max-w-4xl mx-auto flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white mr-3 hover:bg-orange-400/30 rounded-full"
            onClick={() => navigate('/manual')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/aa72c068-2cf3-4b36-be9e-a7eb6351cb9d.png" 
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
            className="h-80 bg-cover bg-center bg-gray-300 relative"
            style={{
              backgroundImage: `url('https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5K33t0GHlpONycxjrqHvHm6kPoArPPyVyaiSbN7K5XZ3mw0omYY.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">
                  วิธีรับมือแผ่นดินไหว ควรทำอย่างไร มีข้อห้ามอะไรบ้าง
                </h1>
                <p className="text-sm opacity-90 mb-2">จาก thairath.co.th</p>
                <p className="text-sm opacity-90">10 มิถุนายน 2568</p>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6 space-y-6">
            <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="font-semibold text-orange-800">ข้อปฏิบัติตัวเมื่อเกิดแผ่นดินไหวเบื้องต้น</h3>
              </div>
              <p className="text-orange-700">
                ควรทำอย่างไรให้ออกมาจากสถานที่นั้นอย่างปลอดภัย และข้อห้ามต่างๆ ที่ไม่ควรทำเพื่อความปลอดภัย
              </p>
            </div>

            <div className="prose max-w-none">
              <p className="text-lg leading-relaxed">
                แผ่นดินไหวนั้นเกิดจากการเคลื่อนตัวของเปลือกโลก เพื่อปรับความสมดุลของเปลือกโลกให้คงที่ (การขยาย และการคืนผิวโลก) และการสั่นสะเทือนของพื้นดิน เป็นการปลดปล่อยพลังงาน หรือแม้แต่เกิดขึ้นจากการกระทำของมนุษย์จากสิ่งปลูกสร้าง เช่น การกักเก็บน้ำจากเขื่อน การทำเหมืองแร่ หรือการทดลองระเบิดปรมาณู เป็นต้น
              </p>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg my-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">เหตุการณ์ล่าสุด</h3>
                <p className="text-red-700">
                  บ่ายวันที่ 28 มีนาคม 2568 เกิดเหตุแผ่นดินไหวขนาด 7.7 ลึก 10 กม. ที่เมียนมาร์ รับรู้แรงสั่นสะเทือนได้หลายจังหวัดในประเทศไทย รวมถึงพื้นที่กรุงเทพมหานคร ตึกสูงใน กทม. รับรู้แรงสั่นสะเทือนได้ ซึ่งส่งผลกระทบมาถึงประเทศไทย และเป็นเวลาสำคัญในการทำงาน ทำให้ผู้ที่อยู่บนตึกสูงต่างรู้สึกตึกโยก และมีการรีบอพยพ เคลื่อนย้ายลงมาจากตึกทันทีเพื่อเฝ้าระวัง
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                วิธีรับมือแผ่นดินไหว
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">1. ตั้งสติ</h3>
                  <p className="text-green-700">
                    การมีสติเป็นเรื่องสำคัญในการรับมือกับแผ่นดินไหว มีผลต่อการเคลื่อนย้ายตนเองออกจากสถานที่นั้นๆ การมีสติจะทำให้ตนเองเคลื่อนย้ายออกมาได้อย่างปลอดภัย รวมถึงการปิดสวิตช์ไฟ แก๊ส และน้ำประปา เพื่อยับยั้งอันตรายอื่นๆ ที่จะตามมา
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">2. ออกจากอาคาร</h3>
                  <p className="text-blue-700">
                    หากอยู่บนอาคาร ให้รีบเคลื่อนย้ายโดยทันที เพราะแผ่นดินไหวมีความเสี่ยงที่จะทำให้ตึก และอาคารทรุด ร้ายแรงถึงขั้นถล่มได้ ให้รีบหาประตูทางออก และหาสิ่งของที่มีลักษณะแข็งเพื่อใช้ป้องกันศีรษะ
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">3. หาที่กำบัง</h3>
                  <p className="text-purple-700">
                    หากอยู่ในที่โล่งแจ้ง ควรหาพื้นที่กำบัง เช่น การหลบใต้อุปกรณ์ที่มีความแข็งแรง หรือหากอยู่บนตึกให้ยืนใกล้ๆ กับกำแพงตรงกลางอาคารจะปลอดภัยที่สุด และห้ามอยู่ใกล้กับหน้าต่างอาคารโดยเด็ดขาด เพราะอาจจะร้าว และแตกเสียหายได้เมื่อเกิดแผ่นดินไหว
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">4. การขับขี่</h3>
                  <p className="text-orange-700">
                    ขณะขับขี่ให้ชะลอรถยนต์ ห้ามหยุดรถยนต์โดยทันที หาที่จอดข้างทางให้เป็นบริเวณโล่งแจ้ง ไม่ติดอาคาร ภูเขา และริมทะเลที่มีความเสี่ยง แล้วหาที่กำบัง
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-6 flex items-center">
                <XCircle className="w-6 h-6 text-red-600 mr-2" />
                สิ่งไม่ควรทำเมื่อเกิดแผ่นดินไหว
              </h2>

              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <ul className="space-y-3 text-red-700">
                  <li className="flex items-start">
                    <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ห้ามใกล้จุดเสี่ยง ที่อาจจะหล่นลงมาทับได้ เช่น เสาไฟฟ้า อาคาร ภูเขา ประตู และหน้าต่าง</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ห้ามใช้ลิฟต์</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ห้ามขับรถยนต์ขณะเกิดแผ่นดินไหว</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ระวังการอยู่ใกล้เขื่อน หรือชายหาด</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-6">
                วิธีปฏิบัติหลังเกิดแผ่นดินไหว
              </h2>

              <div className="grid gap-4">
                {[
                  "ตรวจสอบคนรอบข้างว่าได้รับบาดเจ็บหรือไม่",
                  "ตรวจเช็กท่อน้ำ สายไฟ และสายแก๊สว่ามีการชำรุดเสียหายหรือไม่ ให้มีการแก้ไขทันที เพื่อไม่ให้เกิดเหตุอื่นๆ ตามมา",
                  "เปิดประตู หน้าต่าง ทิ้งไว้ และออกจากพื้นที่ พร้อมแจ้งหน่วยงานที่เกี่ยวข้องทราบ",
                  "ติดตามข่าวสารข้อมูล และคำแนะนำเกี่ยวกับภัยพิบัติ",
                  "ตรวจสอบสภาพความชำรุดเสียหายของโครงสร้างอาคารบ้านเรือน และออกห่างอาคารบ้านเรือนที่ชำรุดเสียหาย",
                  "หากเกิดแผ่นดินไหวแล้ว ให้ใช้บันไดในการสัญจร ควรใส่รองเท้าหนังเพื่อป้องกันไม่ให้ถูกเศษหรือสิ่งของต่างๆ บาด และทำให้บาดเจ็บได้",
                  "บำรุง และรักษาช่องทางกู้ภัย เช่น บันไดหนีไฟ ให้มีความคล่องตัวดังเดิม",
                  "ทำตามคำแนะนำของเจ้าพนักงานในการหนีภัย",
                  "หากอยู่บริเวณท่าเรือ เขื่อน และริมทะเล ให้ออกมาจากบริเวณเหล่านี้ทันที และห้ามเข้าในเขตประสบภัยแผ่นดินไหวโดยมิได้รับอนุญาต",
                  "ควรระมัดระวังการลักขโมยทรัพย์สินด้วย",
                  "ระวังการเกิดแผ่นดินไหวซ้ำ (After shock)"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-800">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg my-6">
                <p className="text-sm text-gray-600">
                  <strong>ข้อมูล:</strong> กองเฝ้าระวังแผ่นดินไหว
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>แหล่งอ้างอิง:</strong> 
                  <a href="https://www.thairath.co.th" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                    thairath.co.th
                  </a>
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
