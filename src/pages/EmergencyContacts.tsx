import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Flame, Heart, Shield, AlertTriangle, Building2, Brain, Siren } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EmergencyContactProps {
  name: string;
  description: string;
  phoneNumber: string;
  icon: React.ReactNode;
  color: string;
}

const thaiEmergencyContacts: EmergencyContactProps[] = [
  {
    name: "เบอร์ฉุกเฉิน 191",
    description: "แจ้งเหตุด่วนเหตุร้าย",
    phoneNumber: "191",
    icon: <Siren className="w-5 h-5" />,
    color: "bg-red-500"
  },
  {
    name: "แจ้งเหตุเพลิงไหม้",
    description: "สถานีดับเพลิง",
    phoneNumber: "199",
    icon: <Flame className="w-5 h-5" />,
    color: "bg-orange-500"
  },
  {
    name: "หน่วยแพทย์ฉุกเฉิน",
    description: "ศูนย์นเรนทร",
    phoneNumber: "1669",
    icon: <Heart className="w-5 h-5" />,
    color: "bg-pink-500"
  },
  {
    name: "กรมป้องกันสาธารณภัย",
    description: "แจ้งเหตุสาธารณภัย",
    phoneNumber: "1784",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-blue-500"
  },
  {
    name: "มูลนิธิร่วมกตัญญู",
    description: "หน่วยกู้ภัย",
    phoneNumber: "1418",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "bg-yellow-500"
  },
  {
    name: "ศูนย์เอราวัณ กทม.",
    description: "สำนักการแพทย์ กรุงเทพฯ",
    phoneNumber: "1646",
    icon: <Building2 className="w-5 h-5" />,
    color: "bg-indigo-500"
  },
  {
    name: "ศูนย์พิษวิทยา",
    description: "รามาธิบดี",
    phoneNumber: "1367",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "bg-purple-500"
  },
  {
    name: "สายด่วนสุขภาพจิต",
    description: "กรมสุขภาพจิต",
    phoneNumber: "1323",
    icon: <Brain className="w-5 h-5" />,
    color: "bg-teal-500"
  },
  {
    name: "กรมควบคุมโรค",
    description: "สายด่วนโรคติดต่อ",
    phoneNumber: "1422",
    icon: <Heart className="w-5 h-5" />,
    color: "bg-green-500"
  }
];

const EmergencyContacts: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCallClick = (name: string, phoneNumber: string) => {
    toast({
      title: `กำลังโทรหา ${name}`,
      description: `เบอร์ ${phoneNumber}`,
    });
    setTimeout(() => {
      window.location.href = `tel:${phoneNumber}`;
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/90 hover:bg-white/20 rounded-xl"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">เบอร์โทรฉุกเฉิน</h1>
              <p className="text-white/70 text-xs">โทรออกได้ทันที 24 ชม.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contact List */}
      <div className="px-4 pt-5 space-y-3">
        {thaiEmergencyContacts.map((contact, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className={`${contact.color} p-2.5 rounded-xl text-white shadow-md`}>
                {contact.icon}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{contact.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{contact.description}</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-0.5">{contact.phoneNumber}</p>
              </div>
            </div>
            <Button
              className="bg-green-500 hover:bg-green-600 rounded-xl h-12 w-12 p-0 shadow-lg"
              onClick={() => handleCallClick(contact.name, contact.phoneNumber)}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyContacts;

