import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, CheckCircle } from 'lucide-react-native';

// Mock available slots
const mockSlots = [
  { id: 's1', date: '2024-02-15', time: '18:00', type: 'single' },
  { id: 's2', date: '2024-02-16', time: '10:00', type: 'openday' },
  { id: 's3', date: '2024-02-16', time: '15:00', type: 'single' },
  { id: 's4', date: '2024-02-17', time: '11:00', type: 'openday' },
  { id: 's5', date: '2024-02-18', time: '17:00', type: 'virtual' },
];

export default function BookingScreen() {
  const { roomId } = useLocalSearchParams();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  const handleBook = () => {
    if (selectedSlot) {
      // In production, API call
      setIsBooked(true);
    }
  };

  if (isBooked) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Prenotazione inviata!</Text>
          <Text style={styles.successText}>
            La tua richiesta di visita è stata inviata al proprietario.
            Riceverai una notifica quando sarà confermata.
          </Text>
          <Pressable 
            style={styles.successButton}
            onPress={() => router.back()}
          >
            <Text style={styles.successButtonText}>Torna all'annuncio</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Seleziona uno slot</Text>
        <Text style={styles.subtitle}>
          Scegli quando vuoi visitare la stanza. Il proprietario confermerà la tua richiesta.
        </Text>

        <View style={styles.slotsContainer}>
          {mockSlots.map((slot) => (
            <Pressable
              key={slot.id}
              style={[
                styles.slotCard,
                selectedSlot === slot.id && styles.slotCardSelected,
              ]}
              onPress={() => setSelectedSlot(slot.id)}
            >
              <View style={[
                styles.slotIcon,
                slot.type === 'openday' && styles.slotIconOpenday,
                slot.type === 'virtual' && styles.slotIconVirtual,
              ]}>
                {slot.type === 'virtual' ? (
                  <Video size={20} color={slot.type === 'virtual' ? '#8b5cf6' : '#0ea5e9'} />
                ) : (
                  <Calendar size={20} color={slot.type === 'openday' ? '#f59e0b' : '#0ea5e9'} />
                )}
              </View>
              
              <View style={styles.slotInfo}>
                <Text style={styles.slotDate}>
                  {new Date(slot.date).toLocaleDateString('it-IT', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
                <View style={styles.slotTimeRow}>
                  <Clock size={14} color="#6b7280" />
                  <Text style={styles.slotTime}>{slot.time}</Text>
                  {slot.type === 'openday' && (
                    <View style={styles.opendayBadge}>
                      <Text style={styles.opendayBadgeText}>Open Day</Text>
                    </View>
                  )}
                  {slot.type === 'virtual' && (
                    <View style={styles.virtualBadge}>
                      <Text style={styles.virtualBadgeText}>Virtuale</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={[
                styles.radioOuter,
                selectedSlot === slot.id && styles.radioOuterSelected,
              ]}>
                {selectedSlot === slot.id && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Come funziona?</Text>
          <Text style={styles.infoText}>
            • <Text style={{ fontWeight: '600' }}>Visita singola:</Text> appuntamento privato con il proprietario
          </Text>
          <Text style={styles.infoText}>
            • <Text style={{ fontWeight: '600' }}>Open Day:</Text> visita di gruppo con altri interessati
          </Text>
          <Text style={styles.infoText}>
            • <Text style={{ fontWeight: '600' }}>Virtuale:</Text> videochiamata per vedere la stanza da remoto
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[
            styles.bookButton,
            !selectedSlot && styles.bookButtonDisabled,
          ]}
          onPress={handleBook}
          disabled={!selectedSlot}
        >
          <Text style={[
            styles.bookButtonText,
            !selectedSlot && styles.bookButtonTextDisabled,
          ]}>
            {selectedSlot ? 'Conferma prenotazione' : 'Seleziona uno slot'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  slotsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  slotCardSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  slotIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIconOpenday: {
    backgroundColor: '#fef3c7',
  },
  slotIconVirtual: {
    backgroundColor: '#ede9fe',
  },
  slotInfo: {
    flex: 1,
  },
  slotDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  opendayBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  opendayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b45309',
  },
  virtualBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  virtualBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0ea5e9',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0ea5e9',
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bookButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookButtonTextDisabled: {
    color: '#9ca3af',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
