import { User, Briefcase } from 'lucide-react';

interface Roommate {
  id: string;
  name: string;
  age: number;
  occupation: string;
  avatar: string;
}

export function RoommateCard({ roommate }: { roommate: Roommate }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
      <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
        {roommate.avatar ? (
          <img 
            src={roommate.avatar} 
            alt={roommate.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-primary-600" />
        )}
      </div>
      <div>
        <h4 className="font-semibold text-gray-800">{roommate.name}, {roommate.age}</h4>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Briefcase className="w-4 h-4" />
          {roommate.occupation}
        </p>
      </div>
    </div>
  );
}
