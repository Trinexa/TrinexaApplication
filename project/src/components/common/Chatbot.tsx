import { useState, useRef, useEffect, FormEvent } from 'react';
import { createDemoBooking } from '../../services/demoBookingService';
import { FaRobot, FaTimes, FaCommentDots, FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('trinexa_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingState, setBookingState] = useState({
    isBooking: false,
    step: 0,
    formData: {
      name: '',
      email: '',
      company: '',
      phone: '',
      productInterest: '',
      attendees: '',
      selectedDay: '',
      selectedTime: '',
      notes: ''
    }
  });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    (messagesEndRef.current as HTMLDivElement | null)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('trinexa_chat_history', JSON.stringify(messages));
  }, [messages]);

  const availableTimeSlots = {
    'Monday': ['10:00 AM', '2:00 PM', '4:00 PM'],
    'Tuesday': ['11:00 AM', '3:00 PM', '5:00 PM'],
    'Wednesday': ['9:00 AM', '1:00 PM', '3:00 PM'],
    'Thursday': ['10:00 AM', '2:00 PM', '4:00 PM'],
    'Friday': ['11:00 AM', '2:00 PM', '4:00 PM']
  };

  const botResponses = {
    introduction: ["I'm the Trinexa, here to help you learn about our company and schedule demo sessions for our products."],
    greeting: ["Hello! Welcome to Trinexa. How can I help you today?", "Hi there! I'm here to assist you with questions about our AI solutions."],
    about: ["Founded in 2025, Trinexa was born from a powerful belief: AI should serve humans — not replace them. We help organizations turn AI into action, delivering real-world impact through intelligent, human-centered solutions."],
    mission: ["Our mission is to democratize AI by making advanced artificial intelligence accessible, practical, and transformative for businesses of all sizes."],
    vision: ["Our vision is to be the global leader in AI innovation, creating a world where intelligent technology enhances human potential and drives sustainable growth."],
    values: ["Our core values are:\n- Excellence: Every detail matters. We build with care, precision, and passion.\n- Collaboration: The best ideas emerge when minds meet. We co-create with clients and our teams.\n- Innovation: We don't follow trends — we create what comes next.\n- Integrity: We believe in doing what's right, even when no one's watching."],
    products: ["We offer two main AI products:\n\n1. Ayura – Mental Health Management System:\nA complete platform for counselors and therapists featuring:\n- Smart Scheduling\n- Online Payments\n- Private Counseling\n- Session Analytics\n- End-to-End Encryption\n\n2. NexaKYC – Smart eKYC System:\nAI-driven identity verification system with:\n- Instant KYC Checks\n- Rule Alignment\n- Risk Alerts\n- Adaptive Learning\n- GDPR & Compliance Ready"],
    purpose: ["To harness the power of AI and technology to create secure, innovative, and impactful solutions that improve lives, empower businesses, and shape a better future"],
    contact: ["You can reach us at:\nPhone: +94 779 305 395\nLocation: Colombo, Sri Lanka"],
    ceo: ["Trinexa was founded by Thenuka Wijewardena, who believes that AI isn't about replacing people - it's about unlocking who we can become with the right tools."],
    demo: ["I'd be happy to help you schedule a demo session! Here are our available time slots:\n\nMonday: 10:00 AM, 2:00 PM, 4:00 PM\nTuesday: 11:00 AM, 3:00 PM, 5:00 PM\nWednesday: 9:00 AM, 1:00 PM, 3:00 PM\nThursday: 10:00 AM, 2:00 PM, 4:00 PM\nFriday: 11:00 AM, 2:00 PM, 4:00 PM\n\nPlease let me know which day and time works best for you, and I'll help you book the session."],
    whoareyou:["Here is Trinexa. Nice to have help you. Providing software solution whatever you want."],
    thanks: [
      "You're welcome! If you have any more questions or need further assistance, just let me know!",
      "Happy to help! Let me know if there's anything else you need.",
      "Anytime! If you want to know more or book a demo, just ask."
    ],
    default: ["I'm not sure about that. Would you like to schedule a demo session to learn more about our products? Just type 'demo' and I'll show you our available time slots."],
    morning: ["Good morning! Hope you have a wonderful day ahead! 🌞"],
    afternoon: ["Good afternoon! How can I assist you today? ☀️"],
    evening: ["Good evening! How can I help you this evening? 🌇"],
    night: ["Good night! If you have any questions, feel free to ask. 🌙"],
    datetime: ["The current date and time is: "]
  };

  const steps = [
    { field: 'name', prompt: 'To get started with booking a demo, could you please provide your full name?' },
    { field: 'email', prompt: 'Great! Now, please share your email address where we can send the demo confirmation.' },
    { field: 'company', prompt: 'Which company are you representing?' },
    { field: 'phone', prompt: 'Please provide your contact number.' },
    { field: 'productInterest', prompt: 'Which of our products are you interested in? (Ayura or NexaKYC)' },
    { field: 'attendees', prompt: 'How many people will be attending the demo?' },
    { field: 'selectedDay', prompt: botResponses.demo[0] },
    { field: 'selectedTime', prompt: 'Please select your preferred time from the available slots.' },
    { field: 'notes', prompt: 'Any specific topics or questions you would like us to cover in the demo?' }
  ];

  const handleBookingStep = (stepOverride?: number) => {
    const stepIndex = typeof stepOverride === 'number' ? stepOverride : bookingState.step;
    return steps[stepIndex];
  };

  // Personalization: set userName after name step
  useEffect(() => {
    if (
      bookingState.formData.name &&
      (!userName || userName !== bookingState.formData.name)
    ) {
      setUserName(bookingState.formData.name);
    }
  }, [bookingState.formData.name]);

  const validateInput = (
    field: string,
    input: string,
    formData: typeof bookingState.formData
  ): string | null => {
    if (!input || input.trim() === '') {
      return 'This field cannot be empty.';
    }

    // Define regex patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    const numberRegex = /^[1-9]\d*$/;

    switch(field) {
      case 'name':
        return input.length >= 2 ? null : 'Please provide your full name (at least 2 characters).';
      case 'email':
        return emailRegex.test(input) ? null : 'Please provide a valid email address.';
      case 'company':
        return input.length >= 2 ? null : 'Please provide a valid company name.';
      case 'phone':
        return phoneRegex.test(input) ? null : 'Please provide a valid phone number.';
      case 'productInterest':
        const products = ['ayura', 'nexakyc'];
        return products.some(p => input.toLowerCase().includes(p)) ? null : 'Please select either Ayura or NexaKYC.';
      case 'attendees':
        return numberRegex.test(input) ? null : 'Please provide a valid number of attendees.';
      case 'selectedDay':
        const dayMatch = Object.keys(availableTimeSlots).find((day: string) => 
          input.toLowerCase().includes(day.toLowerCase())
        );
        return dayMatch ? null : 'Please select a valid day from the available options.';
      case 'selectedTime':
        if (!formData.selectedDay) return 'Please select a day first.';
        const selectedDay = formData.selectedDay as keyof typeof availableTimeSlots;
        const timeMatch = availableTimeSlots[selectedDay]?.find((time: string) =>
          input.toLowerCase().includes(time.toLowerCase())
        );
        return timeMatch ? null : 'Please select a valid time from the available slots.';
      default:
        return null;
    }
  };

  const processBookingInput = async (input: string): Promise<string> => {
    const currentStep = handleBookingStep();
    const updatedFormData = { ...bookingState.formData };

    // Validate input
    const validationResult = validateInput(currentStep.field, input, updatedFormData);
    if (validationResult) {
      return validationResult;
    }

    // Save valid input and advance step for day/time
    if (currentStep.field === 'selectedDay') {
      const dayKey = Object.keys(availableTimeSlots).find((day: string) =>
        input.toLowerCase().includes(day.toLowerCase())
      );
      if (dayKey) {
        updatedFormData.selectedDay = dayKey;
        // Advance to next step (selectedTime) and prompt for time
        const nextStep = bookingState.step + 1;
        setBookingState({
          ...bookingState,
          step: nextStep,
          formData: updatedFormData
        });
        return `Great! Here are the available times for ${dayKey}: ${availableTimeSlots[dayKey as keyof typeof availableTimeSlots].join(', ')}. Please select your preferred time.`;
      } else {
        return 'Please select a valid day from the available options.';
      }
    } else if (currentStep.field === 'selectedTime') {
      const selectedDay = updatedFormData.selectedDay as keyof typeof availableTimeSlots;
      // Normalize user input for time matching
      const userInput = input.trim().toLowerCase().replace(/\s+/g, '');
      const slotMatch = availableTimeSlots[selectedDay]?.find((slot: string) => {
        // Acceptable user input: '11', '11am', '11:00', '11:00am', '11:00 am', etc.
        const slotNorm = slot.toLowerCase().replace(/\s+/g, '');
        // Remove ':' and 'am/pm' for loose matching
        const slotHour = slotNorm.replace(/:|am|pm/g, '');
        const inputHour = userInput.replace(/:|am|pm/g, '');
        // Match hour and minute, or hour only
        return (
          slotNorm === userInput ||
          slotNorm.replace(':', '') === userInput ||
          slotNorm.startsWith(userInput) ||
          slotHour === inputHour ||
          slotNorm.includes(userInput) ||
          (userInput.length <= 2 && slotNorm.startsWith(userInput))
        );
      });
      if (slotMatch) {
        updatedFormData.selectedTime = slotMatch;
        // Advance to next step and prompt for the next field
        const nextStep = bookingState.step + 1;
        setBookingState({
          ...bookingState,
          step: nextStep,
          formData: updatedFormData
        });
        return handleBookingStep(nextStep).prompt;
      } else {
        return 'Please select a valid time from the available slots.';
      }
    } else {
      (updatedFormData as any)[currentStep.field] = input;
    }

    // Move to next step or finalize booking
    if (bookingState.step === steps.length - 1) {
      try {
        // Convert selectedDay and selectedTime to a valid ISO date string for preferred_date
        let preferredDateISO: string | undefined = undefined;
        if (updatedFormData.selectedDay && updatedFormData.selectedTime) {
          // Find the next date for the selected day
          const dayOfWeekMap: Record<string, number> = {
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5
          };
          const now = new Date();
          const today = now.getDay(); // Sunday = 0, Monday = 1, ...
          const targetDay = dayOfWeekMap[updatedFormData.selectedDay];
          let daysToAdd = (targetDay - today + 7) % 7;
          if (daysToAdd === 0) daysToAdd = 7; // always next week if today
          const nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd);
          // Parse time (e.g., '10:00 AM')
          const [time, meridian] = updatedFormData.selectedTime.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (meridian.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (meridian.toUpperCase() === 'AM' && hours === 12) hours = 0;
          nextDate.setHours(hours, minutes, 0, 0);
          preferredDateISO = nextDate.toISOString();
        }
        // Save to Supabase demo_bookings
        const bookingPayload = {
          name: updatedFormData.name,
          email: updatedFormData.email,
          company: updatedFormData.company,
          phone: updatedFormData.phone,
          product_interest: updatedFormData.productInterest,
          preferred_date: preferredDateISO,
          message: updatedFormData.notes,
        };
        await createDemoBooking(bookingPayload);

        // Reset booking state
        setBookingState({
          isBooking: false,
          step: 0,
          formData: {
            name: '',
            email: '',
            company: '',
            phone: '',
            productInterest: '',
            attendees: '',
            selectedDay: '',
            selectedTime: '',
            notes: ''
          }
        });

        // Format confirmation message
        const confirmationDetails = [
          `Demo scheduled for ${updatedFormData.selectedDay} at ${updatedFormData.selectedTime}`,
          `Product: ${updatedFormData.productInterest}`,
          `Attendees: ${updatedFormData.attendees}`,
          'You will receive a confirmation email shortly with meeting details.'
        ].join('\n');

        return `Perfect! Here's your booking confirmation:\n\n${confirmationDetails}\n\nIs there anything else I can help you with?`;
      } catch (error) {
        console.error('Booking error:', error);
        return 'I apologize, but there was an error processing your booking. Please try again or contact our support team.';
      }
    } else {
      // Move to next step and prompt for the next field
      const nextStep = bookingState.step + 1;
      setBookingState({
        ...bookingState,
        step: nextStep,
        formData: updatedFormData
      });
      return handleBookingStep(nextStep).prompt;
    }
  };

  const saveBookingToDatabase = async (bookingData: typeof bookingState.formData): Promise<{ success: boolean }> => {
    try {
      // Log the booking data for development
      console.log('Saving booking:', bookingData);
      
      // Example: API call to your backend
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(bookingData)
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to save booking')
      // }
      // 
      // const result = await response.json()
      // return result

      // For now, simulate successful save
      return { success: true };
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  };

  const getBotResponse = async (message: string): Promise<string> => {
    const lowercaseInput = message.toLowerCase();

    // Name introduction detection
    // Patterns: "i am [name]", "i'm [name]", "my name is [name]"
    const namePatterns = [
      /(?:^|\s)i am ([a-zA-Z][a-zA-Z\s\-']{1,30})/i,
      /(?:^|\s)i'm ([a-zA-Z][a-zA-Z\s\-']{1,30})/i,
      /my name is ([a-zA-Z][a-zA-Z\s\-']{1,30})/i
    ];
    let introducedName = null;
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        introducedName = match[1].trim().split(' ')[0]; // Use first word as name
        break;
      }
    }
    if (introducedName) {
      setUserName(introducedName);
      return `Nice to meet you, ${introducedName}! How can I help you today?`;
    }

    // Greetings
    if (lowercaseInput.includes('good morning')) {
      return userName ? `Good morning, ${userName}! Hope you have a wonderful day ahead! 🌞` : botResponses.morning[0];
    }
    if (lowercaseInput.includes('good afternoon')) {
      return userName ? `Good afternoon, ${userName}! How can I assist you today? ☀️` : botResponses.afternoon[0];
    }
    if (lowercaseInput.includes('good evening')) {
      return userName ? `Good evening, ${userName}! How can I help you this evening? 🌇` : botResponses.evening[0];
    }
    if (lowercaseInput.includes('good night')) {
      return userName ? `Good night, ${userName}! If you have any questions, feel free to ask. 🌙` : botResponses.night[0];
    }

    // Date and time
    if (
      lowercaseInput.includes('date and time') ||
      (lowercaseInput.includes('time') && lowercaseInput.includes('now')) ||
      (lowercaseInput.includes('what') && lowercaseInput.includes('time')) ||
      (lowercaseInput.includes('what') && lowercaseInput.includes('date'))
    ) {
      const now = new Date();
      return botResponses.datetime[0] + now.toLocaleString();
    }

    // Check for gratitude
    if (lowercaseInput.includes('thank you') || lowercaseInput.includes('thanks')) {
      return userName ? `You're welcome, ${userName}! If you have any more questions, just let me know!` : botResponses.thanks[Math.floor(Math.random() * botResponses.thanks.length)];
    }

    // Check for name/identity questions
    if (lowercaseInput.includes('what is your name') || 
        lowercaseInput.includes('who are you') ||
        lowercaseInput.includes('your name') ||
        lowercaseInput.includes('introduce yourself')) {
      return userName ? `Hi ${userName}, ${botResponses.introduction[0]}` : botResponses.introduction[Math.floor(Math.random() * botResponses.introduction.length)];
    }

    // Handle booking process
    if (bookingState.isBooking) {
      return await processBookingInput(message);
    }

    // Start booking process
    if (lowercaseInput.includes('demo') || lowercaseInput.includes('book') || lowercaseInput.includes('schedule')) {
      setBookingState({ ...bookingState, isBooking: true });
      return handleBookingStep().prompt;
    }

    // Standard responses
    if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
      return userName ? `Hello, ${userName}! How can I help you today?` : botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)];
    } else if (lowercaseInput.includes('product')) {
      return botResponses.products[0];
    } else if (lowercaseInput.includes('about')) {
      return botResponses.about[0];
    } else if (lowercaseInput.includes('mission')) {
      return botResponses.mission[0];
    } else if (lowercaseInput.includes('vision')) {
      return botResponses.vision[0];
    } else if (lowercaseInput.includes('value')) {
      return botResponses.values[0];
    } else if (lowercaseInput.includes('ceo') || lowercaseInput.includes('founder')) {
      return botResponses.ceo[0];
    } else if (lowercaseInput.includes('contact') || lowercaseInput.includes('reach') || lowercaseInput.includes('phone')) {
      return botResponses.contact[0];
    } else if (lowercaseInput.includes('who are you') || lowercaseInput.includes('reach') || lowercaseInput.includes('phone')) {
      return botResponses.whoareyou[0];
    } else if (lowercaseInput.includes('purpose') || lowercaseInput.includes('reach') || lowercaseInput.includes('phone')) {
      return botResponses.purpose[0];
    } else if (lowercaseInput.includes('company') || lowercaseInput.includes('reach') || lowercaseInput.includes('phone')) {
      return botResponses.introduction[0];
    }
    return botResponses.default[0];
  };

  const resetBooking = (): void => {
    setBookingState({
      isBooking: false,
      step: 0,
      formData: {
        name: '',
        email: '',
        company: '',
        phone: '',
        productInterest: '',
        attendees: '',
        selectedDay: '',
        selectedTime: '',
        notes: ''
      }
    });
  };

  const handleCancel = (): void => {
    const cancelMessage = {
      text: 'Booking process cancelled. Is there anything else I can help you with?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, cancelMessage]);
    resetBooking();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Store user's message
    const userInput = inputMessage.trim();
    setInputMessage('');

    const userMessage = {
      text: userInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev: typeof messages) => [...prev, userMessage]);

    try {
      setIsLoading(true);
      setIsBotTyping(true);
      // Simulate bot typing delay
      await new Promise((res) => setTimeout(res, 700));
      const response = await getBotResponse(userInput);
      const botMessage = {
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages: typeof messages) => [...prevMessages, botMessage]);
      // Show feedback prompt after booking confirmation
      if (typeof response === 'string' && response.includes('booking confirmation')) {
        setTimeout(() => setShowFeedback(true), 1000);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        text: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages: typeof messages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsBotTyping(false);
    }
  };

  return (
    <div className="fixed z-50 font-sans w-auto" style={{ right: 16, bottom: 16 }}>
      {!isOpen && (
        <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 50 }}>
          <div className="flex flex-col items-center">
            <span className="mb-1 animate-bounce text-xs bg-green-400 text-white px-2 py-0.5 rounded-full shadow font-bold select-none" style={{ zIndex: 51 }}>Hiii 👋</span>
            <button
              onClick={() => setIsOpen(true)}
              className="z-50 bg-gradient-to-br from-[#bbf7d0] via-[#6ee7b7] to-[#a7f3d0] text-green-900 rounded-full shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 border-2 border-[#6ee7b7] flex items-center justify-center animate-bounce"
              style={{ width: 56, height: 56, minWidth: 48, minHeight: 48 }}
              aria-label="Open chatbot"
            >
              <FaCommentDots className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="bg-gradient-to-br from-[#f0fdfa] via-[#bbf7d0] to-[#a7f3d0] rounded-2xl shadow-2xl flex flex-col transition-transform duration-300 opacity-100 border-2 border-[#6ee7b7]"
          style={{
            position: 'fixed',
            right: 8,
            bottom: 8,
            width: '96vw',
            maxWidth: 400,
            height: '80vh',
            maxHeight: 600,
            zIndex: 9999
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6ee7b7] via-[#bbf7d0] to-[#a7f3d0] text-green-900 p-4 rounded-t-2xl flex justify-between items-center shadow-md border-b-2 border-[#6ee7b7]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <FaRobot className="w-7 h-7 text-[#22c55e] drop-shadow-lg" />
              <span className="font-bold text-lg tracking-wide drop-shadow text-green-900">Trinexa <span className='ml-1'>😊</span></span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors duration-300"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent" aria-live="polite">
            {messages.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-auto min-w-[24px] max-w-[120px] h-6 px-2 rounded-full flex items-center justify-center ${message.isUser ? 'bg-green-100' : 'bg-blue-100'}`}>
                      <span className={`text-xs font-semibold whitespace-nowrap ${message.isUser ? 'text-green-700' : 'text-blue-600'}`}>
                        {message.isUser ? (userName || 'You') : 'Trinexa'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-xl shadow-md border break-words whitespace-pre-line overflow-x-auto ${message.isUser ? 'bg-gradient-to-r from-[#6ee7b7] to-[#22c55e] text-green-900 border-[#6ee7b7]' : 'bg-white/80 text-green-900 border-[#bbf7d0]'}`}
                  >
                    {message.text.split('\n').map((line: string, i: number) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                    {message.isUser && (
                      <span className="text-xs text-blue-100 block mt-1">{message.timestamp}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-auto min-w-[24px] max-w-[120px] h-6 px-2 rounded-full flex items-center justify-center bg-blue-100">
                      <span className="text-xs font-semibold whitespace-nowrap text-blue-600">Trinexa</span>
                    </div>
                    <span className="text-xs text-gray-500">typing...</span>
                  </div>
                  <div className="max-w-[80%] p-3 rounded-xl shadow-md border bg-white/80 text-green-900 border-[#bbf7d0]">
                    <span className="italic text-gray-400">Trinexa is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Booking Controls */}
          {bookingState.isBooking && (
            <div className="px-4 py-2 border-t bg-[#bbf7d0]">
              <button
                onClick={handleCancel}
                className="text-sm text-red-600 hover:text-red-800 transition-colors duration-300"
              >
                Cancel Booking
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-transparent" aria-label="Send a message">
            <div className="flex gap-2 items-center relative">
              {isLoading && (
                <div className="absolute right-20 top-1/2 transform -translate-y-1/2" aria-live="polite">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#22c55e]"></div>
                </div>
              )}
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 py-3 px-4 border-2 border-[#6ee7b7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] bg-white text-green-900 shadow text-base min-h-[48px] resize-none"
                rows={2}
                aria-label="Message input"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // Call handleSubmit logic directly for textarea Enter
                    if (!isLoading && inputMessage.trim()) {
                      const fakeFormEvent = { preventDefault: () => {} } as FormEvent<HTMLFormElement>;
                      handleSubmit(fakeFormEvent);
                    }
                  }
                }}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#bbf7d0] to-[#22c55e] text-green-900 px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 hover:from-[#22c55e] hover:to-[#bbf7d0] transition-all duration-300 border-2 border-white flex items-center justify-center"
                aria-label="Send message"
              >
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </form>
          {/* Feedback Prompt */}
          {showFeedback && (
            <div className="p-4 border-t bg-[#bbf7d0] flex flex-col gap-2">
              <label htmlFor="feedback" className="text-green-900 font-semibold">How was your experience with Trinexa?</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={2}
                className="p-2 border-2 border-[#6ee7b7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] bg-white text-green-900 shadow text-base resize-none"
                placeholder="Your feedback..."
                aria-label="Feedback input"
              />
              <button
                className="self-end bg-gradient-to-r from-[#bbf7d0] to-[#22c55e] text-green-900 px-4 py-1 rounded-xl font-semibold shadow hover:scale-105 hover:from-[#22c55e] hover:to-[#bbf7d0] transition-all duration-300 border-2 border-white"
                onClick={() => { setShowFeedback(false); setFeedback(''); setMessages((prev: typeof messages) => [...prev, { text: 'Thank you for your feedback! 😊', isUser: false, timestamp: new Date().toLocaleTimeString() }]); }}
              >
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;