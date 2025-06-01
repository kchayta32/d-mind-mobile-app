
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FilePdf, Menu } from 'lucide-react';

const WeatherForecastJuly2025Article = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/emergency-manual');
  };

  const handlePdfDownload = () => {
    // This would open the PDF in a new window
    window.open('/media/climate/climate-monthly/เอกสารแนบ_คาดหมายเดอนกรกฎาคม2568_1.pdf', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <div className="container max-w-6xl mx-auto p-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={handleBackClick} 
              className="text-white hover:bg-white/20 mr-4 rounded-full p-2"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="h-10 w-10 mr-4"
              />
              <h1 className="text-2xl font-bold">คาดหมายอากาศรายเดือน ก.ค. 2568</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto p-6">
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <header className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 border-b border-gray-100">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              คาดหมายอากาศรายเดือน ก.ค. 2568
            </h1>
            <p className="text-sm text-gray-500 mb-4">จาก กรมอุตุนิยมวิทยา</p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 px-3 py-1 text-sm font-medium">
                การพยากรณ์อากาศ
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>วันที่ข้อมูล 01 กรกฎาคม 2568</span>
              <Button 
                onClick={handlePdfDownload}
                variant="outline"
                className="flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                <FilePdf className="h-4 w-4" />
                ดาวน์โหลดเอกสาร
              </Button>
            </div>
          </header>

          {/* Table of Contents */}
          <div className="p-8 border-b border-gray-100 bg-gray-50">
            <Button variant="outline" className="flex items-center gap-2 mb-4">
              <Menu className="h-4 w-4 text-green-600" />
              <span className="text-green-600">เนื้อหาในหน้านี้</span>
            </Button>
            
            <div className="bg-white rounded-lg border p-4 space-y-2">
              <a href="#item-1" className="block p-2 hover:bg-blue-50 rounded transition-colors">
                <p className="text-gray-800">คาดหมายอากาศรายเดือนแบบอินโฟกราฟิก</p>
              </a>
              <a href="#item-2" className="block p-2 hover:bg-blue-50 rounded transition-colors">
                <p className="text-gray-800">คาดหมายอากาศทั่วไป</p>
              </a>
              <a href="#item-3" className="block p-2 hover:bg-blue-50 rounded transition-colors">
                <p className="text-gray-800">คาดหมายอากาศรายภาค</p>
              </a>
            </div>
          </div>

          <div className="p-8">
            {/* Section 1: Infographic Forecast */}
            <section id="item-1" className="mb-12">
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className="text-3xl font-bold text-blue-800">คาดหมายอากาศรายเดือนแบบอินโฟกราฟิก</h2>
                <span className="text-lg text-gray-600">กรกฎาคม 2568</span>
              </div>
              
              {/* Weather Map Placeholder */}
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-xl p-8 mb-6 text-center">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">แผนที่คาดหมายอากาศประเทศไทย</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800">ภาคเหนือ</h4>
                      <p className="text-gray-700">32-34°C / 24-26°C</p>
                      <p className="text-gray-700">ฝน 150-190 มม.</p>
                      <p className="text-gray-700">13-16 วันฝน</p>
                      <p className="text-gray-700">ความชื้น 75-80%</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800">ภาคตะวันออกเฉียงเหนือ</h4>
                      <p className="text-gray-700">33-35°C / 24-26°C</p>
                      <p className="text-gray-700">ฝน 230-270 มม.</p>
                      <p className="text-gray-700">15-20 วันฝน</p>
                      <p className="text-gray-700">ความชื้น 75-80%</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800">ภาคตะวันออก</h4>
                      <p className="text-gray-700">32-34°C / 25-27°C</p>
                      <p className="text-gray-700">ฝน 260-310 มม.</p>
                      <p className="text-gray-700">15-20 วันฝน</p>
                      <p className="text-gray-700">ความชื้น 80-85%</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800">ภาคกลาง</h4>
                      <p className="text-gray-700">33-35°C / 24-26°C</p>
                      <p className="text-gray-700">ฝน 140-180 มม.</p>
                      <p className="text-gray-700">15-20 วันฝน</p>
                      <p className="text-gray-700">ความชื้น 75-80%</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800">ภาคใต้ (ฝั่งตะวันตก)</h4>
                      <p className="text-gray-700">31-33°C / 24-26°C</p>
                      <p className="text-gray-700">ฝน 310-370 มม.</p>
                      <p className="text-gray-700">16-20 วันฝน</p>
                      <p className="text-gray-700">ความชื้น 80-85%</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800">ภาคใต้ (ฝั่งตะวันออก)</h4>
                      <p className="text-gray-700">33-35°C / 24-26°C</p>
                      <p className="text-gray-700">ฝน 100-140 มม.</p>
                      <p className="text-gray-700">14-16 วันฝน</p>
                      <p className="text-gray-700">ความชื้น 75-80%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">ออกประกาศ 26 พฤษภาคม 2568 10:00 น.</p>
            </section>

            {/* Section 2: General Forecast */}
            <section id="item-2" className="mb-12">
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className="text-3xl font-bold text-blue-800">คาดหมายอากาศทั่วไป</h2>
                <span className="text-lg text-gray-600">กรกฎาคม 2568</span>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed mb-4">
                  <strong>ช่วงต้นและกลางเดือน</strong> ปริมาณและการกระจายของฝนยังคงมีน้อย โดยจะมีฝนร้อยละ 20 - 30 ของพื้นที่เป็นส่วนใหญ่ 
                  และจะก่อให้เกิดสภาวะฝนทิ้งช่วงในหลายพื้นที่ โดยเฉพาะพื้นที่แล้งซ้ำซากนอกเขตชลประทาน เนื่องจาก มรสุมตะวันตกเฉียงใต้ที่พัดปกคลุมประเทศไทยยังคงมีกำลังอ่อน
                </p>
                
                <p className="text-lg leading-relaxed mb-4">
                  <strong>จากนั้นในช่วงครึ่งหลังของเดือน</strong> ปริมาณและการกระจายของฝนจะเพิ่มมากขึ้นและต่อเนื่อง กับจะมีฝนหนักถึงหนักมากในบางแห่ง 
                  โดยเฉพาะบริเวณภาคตะวันออก ภาคตะวันออกเฉียงเหนือและภาคใต้ฝั่งตะวันตก เนื่องจาก มรสุมตะวันตกเฉียงใต้ที่พัดปกคลุมบริเวณประเทศไทย 
                  จะกลับมามีกำลังแรงขึ้น ประกอบกับในบางช่วงจะมีร่องมรสุมพาดผ่านบริเวณตอนบนของทั้งภาคเหนือ และภาคตะวันออกเฉียงเหนือ
                </p>
                
                <p className="text-lg leading-relaxed mb-6">
                  <strong>สรุปเดือนนี้</strong> คาดว่าปริมาณฝนรวมบริเวณประเทศไทยส่วนใหญ่จะใกล้เคียงถึงมากกว่าค่าปกติเล็กน้อยประมาณร้อยละ 5 
                  เว้นแต่ ภาคเหนือ ปริมาณฝนรวมจะน้อยกว่าค่าปกติประมาณร้อยละ 10 และภาคใต้ฝั่งตะวันตก ปริมาณฝนรวมจะน้อยกว่าค่าปกติประมาณร้อยละ 5 
                  ส่วนอุณหภูมิเฉลี่ยยังคงสูงกว่าค่าปกติ
                </p>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-6">
                <h3 className="text-xl font-semibold text-yellow-800 mb-3">ข้อควรระวัง</h3>
                <p className="text-gray-700 leading-relaxed">
                  เดือนนี้ มักจะมีพายุหมุนเขตร้อนก่อตัวในมหาสมุทรแปซิฟิกเหนือด้านตะวันตก และเคลื่อนตัวผ่านประเทศฟิลิปปินส์ลงสู่ทะเลจีนใต้ 
                  ซึ่งจะส่งผลให้มรสุมตะวันตกเฉียงใต้ที่พัดปกคลุมทะเลอันดามัน และประเทศไทยมีกำลังแรงขึ้น ทำให้ประเทศไทยมีฝนตกเพิ่มขึ้น 
                  โดยเฉพาะบริเวณชายฝั่งภาคตะวันออกและภาคใต้ฝั่งตะวันตก จึงขอให้ประชาชนติดตามข่าวพยากรณ์อากาศจากกรมอุตุนิยมวิทยาไว้ด้วย
                </p>
              </div>
              
              <p className="text-sm text-gray-500">ออกประกาศ 26 พฤษภาคม 2568 10:00 น.</p>
            </section>

            {/* Section 3: Regional Forecast */}
            <section id="item-3" className="mb-12">
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className="text-3xl font-bold text-blue-800">คาดหมายอากาศรายภาค</h2>
                <span className="text-lg text-gray-600">กรกฎาคม 2568</span>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">ภาคเหนือ</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ประมาณครึ่งแรกของเดือน ยังคงมีฝนน้อย จากนั้นจะมีฝนเพิ่มมากขึ้น โดยมีฝนฟ้าคะนองร้อยละ 40 - 60 ของพื้นที่ 
                    กับมีฝนหนักบางแห่งในบางวัน
                  </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">ภาคตะวันออกเฉียงเหนือ</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ประมาณครึ่งแรกของเดือนยังคงมีฝนน้อย จากนั้นจะมีฝนเพิ่มมากขึ้น โดยมีฝนฟ้าคะนองร้อยละ 40 - 60 ของพื้นที่ 
                    กับมีฝนหนักบางแห่งในบางวัน
                  </p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">ภาคกลาง</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ประมาณครึ่งแรกของเดือนยังคงมีฝนน้อย จากนั้นจะมีฝนเพิ่มมากขึ้น โดยมีฝนฟ้าคะนองร้อยละ 40 - 60 ของพื้นที่ 
                    กับมีฝนหนักบางแห่งในบางวัน
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-800 mb-3">ภาคตะวันออก</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ประมาณครึ่งแรกของเดือนยังคงมีฝนน้อย ทะเลมีคลื่นสูง 1-2 เมตร จากนั้นจะมีฝนฟ้าคะนองร้อยละ 60 - 80 ของพื้นที่ 
                    กับมีฝนหนักถึงหนักมากบางแห่งในบางวัน ทะเลมีคลื่นสูง 2-3 เมตร
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-3">ภาคใต้ (ฝั่งตะวันออก)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ประมาณครึ่งแรกของเดือนยังคงมีฝนน้อย จากนั้นจะมีฝนฟ้าคะนองร้อยละ 40 - 60 ของพื้นที่ กับมีฝนหนักบางแห่งในบางวัน 
                    ทะเลมีคลื่นสูงประมาณ 1 เมตร
                  </p>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-800 mb-3">ภาคใต้ (ฝั่งตะวันตก)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ประมาณครึ่งแรกของเดือนยังคงมีฝนน้อย ทะเลมีคลื่นสูง 1-2 เมตร จากนั้นจะมีฝนฟ้าคะนองร้อยละ 60 - 80 ของพื้นที่ 
                    กับมีฝนหนักถึงหนักมากบางแห่งในบางวัน ทะเลมีคลื่นสูง 2-3 เมตร
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">กรุงเทพและปริมณฑล</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ประมาณครึ่งแรกของเดือนยังคงมีฝนน้อย จากนั้นจะมีฝนเพิ่มมากขึ้น โดยมีฝนฟ้าคะนองร้อยละ 40 - 60 ของพื้นที่ 
                    กับมีฝนหนักบางแห่งในบางวัน
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">ออกประกาศ 26 พฤษภาคม 2568 10:00 น.</p>
            </section>
          </div>
        </article>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={handleBackClick}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            กลับหน้าหลัก
          </Button>
        </div>
      </main>
    </div>
  );
};

export default WeatherForecastJuly2025Article;
