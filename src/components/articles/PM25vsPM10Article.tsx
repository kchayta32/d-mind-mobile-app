
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PM25vsPM10Article: React.FC = () => {
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
              backgroundImage: `url('https://smartairfilters.com/wordpress/wp-content/uploads/sites/11/2021/05/WordPress-Heading-5.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">
                  PM2.5 vs. PM10 ต่างกันอย่างไร
                </h1>
                <p className="text-sm opacity-90">พฤษภาคม 19, 2021 โดย Smart Air Thailand</p>
                <p className="text-sm opacity-90">จาก smartairfilters.com</p>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6 space-y-6">
            <div className="prose max-w-none">
              <p className="text-lg leading-relaxed mb-6">
                PM2.5 และ PM10 เป็นมลพิษทางอากาศที่<a href="https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health" className="text-blue-600 hover:underline">องค์การอนามัยโลก (WHO) ประเมินว่าส่งผลกระทบ</a>ต่อ "ผู้คนมากกว่ามลพิษอื่นๆ" ซึ่งแน่นอนว่ามลพิษทั้งสองตัวนี้ไม่ได้เหมือนกันซะทีเดียว
              </p>

              <div className="text-center my-6">
                <img 
                  src="https://lh3.googleusercontent.com/rDoWNQwq-HHZ0uOTyIa6WSkyLzgT128WKiDbnN5p-j1Rmusf53384rL7-QoxhcFNAsvgBL6T1uRxrRwc2EGEEXFoMS8Fyzba1qvKDILMlTyb72RtfaGgIJtyA1Z0Xwmd1M_SH-Xk" 
                  alt="PM2.5 vs PM10 comparison" 
                  className="mx-auto rounded-lg shadow-md max-w-full h-auto"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                PM2.5 vs. PM10
              </h2>
              
              <p className="text-lg leading-relaxed mb-6">
                ความแตกต่างระหว่าง PM2.5 และ PM10 คือ ขนาด "PM" ย่อมาจาก Particulate Matter ซึ่งหมายถึง ฝุ่นละอองในอากาศ เช่น ฝุ่นจากการก่อสร้าง อนุภาคถ่านหินจากโรงไฟฟ้า หรือแม้แต่อนุภาคในควันธูปและควันบุหรี่ เป็นต้น
              </p>

              <div className="text-center my-6">
                <img 
                  src="https://lh6.googleusercontent.com/PZQWCQYmlJU_x3ma7M517XgdfjP0V66rIRq9ZQ0OFUC0qXdiFspRRw4QSBvwxRwTpeSMy1tIwQEdHTf5JZ5-Yr1_dZ63LXM-TFRut0j4tPqDv9fu7_muP2cegZAc3wW1KAd1Ea74" 
                  alt="PM particles sources" 
                  className="mx-auto rounded-lg shadow-md max-w-full h-auto"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 my-6">
                <p className="text-blue-800">
                  <strong>อ่านเพิ่มเติม:</strong> หากคุณสงสัยว่ามลพิษอากาศที่ปกคลุมเมืองอยู่มีอนุภาคขนาดเท่าใด ลองอ่าน<a href="https://www.ncbi.nlm.nih.gov/pubmed/25105755" className="text-blue-600 hover:underline">นวิจัยนี้ที่ทำการศึกษาโดยจากนักวิจัยในเซี่ยงไฮ้ ซึ่งได้วิเคราะห์ว่าอนุภาคเหล่านั้นมีที่มาที่ไปอย่างไร</a>
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                ขนาดมีความสำคัญหรือไม่
              </h2>

              <p className="text-lg leading-relaxed mb-6">
                PM10 และ PM2.5 หมายถึงอนุภาคที่มีขนาด 10 ไมครอน 2.5 ไมครอน ตามลำดับ (หรือ ไมโครมิเตอร์) ไมครอนมีขนาดเล็กมาก จะเล็กขนาดไหน เรามาลองดูภาพของไมครอนเมื่อเทียบกับเส้นผมของมนุษย์:
              </p>

              <div className="text-center my-6">
                <img 
                  src="https://lh5.googleusercontent.com/qOkc5QQwhUk9W8zqv1zPu9vX8ZThLrVPpIsIhVEqosS78X2iJiPm4QFjY_S-V9YZrLO7jq_P6lybJMdJxrIDjrNO5s6azdzAtVlJ5C7cRWOPocXNgMJjUCa00vRufTBo6_alP4Rt" 
                  alt="PM2.5 PM10 hair sand difference" 
                  className="mx-auto rounded-lg shadow-md max-w-full h-auto"
                />
              </div>

              <p className="text-lg leading-relaxed mb-6">
                รูปถัดไปแสดงให้เห็นว่า คำว่า "PM10" และ "PM2.5" จริงๆแล้วหมายถึงอนุภาคที่ "เล็กกว่า" ตัวเลขที่ระบุเอาไว้ มลพิษแต่ละประเภทที่มีขนาดเท่ากับหรือต่ำกว่า PM10 จะมีชื่อเรียกว่าอนุภาคขนาด 10 ไมครอน ส่วน PM2.5 คือ มลพิษที่มีขนาดเท่ากับ 2.5 ไมครอน หรือต่ำกว่า (นั่นหมายความว่า PM2.5 จัดเป็นมลพิษขนาด PM10 ด้วยเช่นกัน)
              </p>

              <div className="text-center my-6">
                <img 
                  src="https://lh5.googleusercontent.com/BYUDYbBm2SqmIu8JJGuoLvKJLjKt5jhHBbGyY2j8FMaIbqRlVbyRHKJfsr-D_tShv77JaWgHzGz7tEC-cbyqUHpMH6iqF4JEqIF45hfPlCCguZgWkJub0JODF2cQrs5IKU6_r2Eb" 
                  alt="PM2.5 Particle Size Bacteria Virus" 
                  className="mx-auto rounded-lg shadow-md max-w-full h-auto"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                อะไรที่ไม่นับว่าเป็น PM10 และ PM2.5
              </h2>

              <p className="text-lg leading-relaxed mb-6">
                น่าคิดเลยทีเดียวใช่ไหม ว่าอะไรที่ใช่หรือไม่ใช่มลพิษ PM อนุภาคมลพิษที่ไม่รวมถึงแก๊สมลพิษ เช่นโอโซนและ NO2 นอกจากนี้ยังไม่รวมแก๊สมลพิษที่มักเกิดจากภายในบ้าน เช่น สารฟอร์มาลดีไฮด์จากเฟอร์นิเจอร์ใหม่ หรือสารในสีทาบ้าน เป็นต้น
              </p>

              <div className="text-center my-6">
                <img 
                  src="https://lh3.googleusercontent.com/jxj-p5kLWP2LjiA7Wicb0vbM79c-SmgO8ozlB7QIIvf3rWLmRU6AE4qizr8UGK1WytYzFYjZYPWufWfTC0DvetGJj1iz4FP0ZRXN8JtPmUaECj7bZ7CFbu7p5PZwCPiZozAkpLMk" 
                  alt="Types of air pollution" 
                  className="mx-auto rounded-lg shadow-md max-w-full h-auto"
                />
              </div>

              <p className="text-lg leading-relaxed mb-4">สำหรับคนที่สงสัยเกี่ยวกับมลพิษอากาศ:</p>

              <ol className="list-decimal pl-6 space-y-2 mb-6 text-lg">
                <li><a href="https://www.quora.com/What-does-PM-2-5-mean-in-air-pollution-and-how-is-it-measured/answer/Thomas-Talhelm" className="text-blue-600 hover:underline">การวัดค่า PM2.5 ของรัฐบาล</a> (รวมถึงเคล็ดลับในการกำจัดอนุภาคต่างๆ ในอากาศที่มีขนาดใหญ่กว่า 2.5 ไมครอน)</li>
                <li>อนุภาคเหล่านี้<a href="https://smartairfilters.com/en/blog/35-college-students-purifier-health-effects/" className="text-blue-600 hover:underline">ส่งผลต่อร่างกายของเราอย่างไร</a>และ<a href="https://smartairfilters.com/en/blog/smogdoesntkilllikeyouthinkitdoes/" className="text-blue-600 hover:underline">ทำไมถึงไม่ได้อันตรายจนถึงแก่ชีวิตอย่างที่เราเข้าใจ</a></li>
                <li><a href="https://www.quora.com/Can-the-Quora-community-in-Delhi-come-together-to-think-of-viable-solutions-for-air-pollution-in-Delhi-I-created-a-google-sheet-for-the-action-plans-which-we-can-think-of/answer/Thomas-Talhelm" className="text-blue-600 hover:underline">จากผลการทดลองนี้</a> เราได้วัดค่า P2.5 ในบ้านที่ปักกิ่ง และมาดูกันว่า<a href="https://smartairfilters.com/en/blog/how-to-make-diy-air-purifier/" className="text-blue-600 hover:underline">เครื่องฟอกอากาศ DIY </a>สามารถกรอง PM2.5 ได้หรือไม่</li>
              </ol>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-8">
                <h2 className="text-xl font-bold text-green-800 mb-4">สรุป:</h2>
                <p className="text-green-700 text-lg leading-relaxed">
                  PM10 คืออนุภาคที่มีขนาดเท่ากับหรือเล็กกว่า 10 ไมครอน ในขณะที่ PM2.5 คือออนุภาคที่มีขนาดเท่ากับหรือเล็กกว่า 2.5 ไมครอน ส่วนแก๊สมลพิษอย่างโอโซนและ NO2 ไม่นับเป็นส่วนหนึ่งของฝุ่น PM
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg my-6">
                <p className="text-sm text-gray-600">
                  <strong>แหล่งอ้างอิง:</strong> 
                  <a href="https://smartairfilters.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                    Smart Air Filters Thailand
                  </a>
                  <span className="mx-2">,</span>
                  <a href="https://www.who.int/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    องค์การอนามัยโลก (WHO)
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

export default PM25vsPM10Article;
