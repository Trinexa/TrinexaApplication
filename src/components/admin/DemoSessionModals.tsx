import React, { useState } from 'react';
import { X, Calendar, Users, CheckCircle } from 'lucide-react';
import { api, TeamMemberProfile, DemoSessionAssignment, AvailableTimeSlot } from '../../services/api';
import { DemoEmailService } from '../../services/demoEmailService';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';

interface TeamAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoBooking: any;
  onAssignmentComplete: () => void;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoBooking: any;
  assignments: DemoSessionAssignment[];
  onScheduleComplete: () => void;
}

const TeamAssignmentModal: React.FC<TeamAssignmentModalProps> = ({
  isOpen,
  onClose,
  demoBooking,
  onAssignmentComplete
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [availableMembers, setAvailableMembers] = useState<TeamMemberProfile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; role: string }[]>([]);
  const [assignments, setAssignments] = useState<DemoSessionAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const roles = ['BA', 'SE', 'Manager', 'Sales', 'QA', 'DevOps'];

  React.useEffect(() => {
    if (isOpen) {
      loadExistingAssignments();
    }
  }, [isOpen]);

  const loadExistingAssignments = async () => {
    try {
      const existingAssignments = await api.demoTeamAssignments.getByDemoId(demoBooking.id);
      setAssignments(existingAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleRoleChange = async (role: string) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      const members = await api.teamMembers.getByRole(role);
      setAvailableMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (memberId: string, roleInDemo: string) => {
    const isAlreadySelected = selectedMembers.some(m => m.id === memberId);
    if (isAlreadySelected) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, { id: memberId, role: roleInDemo }]);
    }
  };

  const handleAssignMembers = async () => {
    setLoading(true);
    try {
      // Get current user ID
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        console.error('No authenticated user found');
        return;
      }

      const newAssignments = [];
      
      for (const member of selectedMembers) {
        const assignment = await api.demoTeamAssignments.assign({
          demo_booking_id: demoBooking.id,
          team_member_id: member.id,
          role_in_demo: member.role,
          assigned_by: currentUserId,
          notes: `Assigned as ${member.role} for ${demoBooking.product_interest} demo`
        });
        newAssignments.push(assignment);
      }
      
      // Send assignment notification emails
      try {
        await DemoEmailService.sendTeamAssignmentNotifications(demoBooking, newAssignments);
        console.log('✅ Assignment notification emails sent');
      } catch (emailError) {
        console.warn('⚠️ Failed to send assignment emails:', emailError);
      }
      
      await loadExistingAssignments();
      setSelectedMembers([]);
      setSelectedRole('');
      setAvailableMembers([]);
      onAssignmentComplete();
    } catch (error) {
      console.error('Error assigning members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await api.demoTeamAssignments.remove(assignmentId);
      await loadExistingAssignments();
    } catch (error) {
      console.error('Error removing assignment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-blue-600" />
            Assign Team Members
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Demo Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Demo Session Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Client:</strong> {demoBooking.name}</div>
              <div><strong>Company:</strong> {demoBooking.company}</div>
              <div><strong>Product:</strong> {demoBooking.product_interest}</div>
              <div><strong>Preferred Date:</strong> {demoBooking.preferred_date}</div>
            </div>
          </div>

          {/* Current Assignments */}
          {assignments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Current Team Assignments</h3>
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between bg-green-50 p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{assignment.team_member?.name}</div>
                        <div className="text-sm text-gray-600">{assignment.role_in_demo} - {assignment.team_member?.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <h3 className="font-semibold mb-3">Select Role to Assign</h3>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Available Team Members */}
          {selectedRole && (
            <div>
              <h3 className="font-semibold mb-3">Available {selectedRole} Team Members</h3>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : availableMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableMembers.map((member) => {
                    const isSelected = selectedMembers.some(m => m.id === member.id);
                    const isAlreadyAssigned = assignments.some(a => a.team_member_id === member.id);
                    
                    return (
                      <div
                        key={member.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isAlreadyAssigned
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => !isAlreadyAssigned && handleMemberSelect(member.id, `Lead ${selectedRole}`)}
                      >
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                        <div className="text-sm text-gray-500">{member.department}</div>
                        {member.expertise && (
                          <div className="text-xs text-blue-600 mt-1">
                            {member.expertise.join(', ')}
                          </div>
                        )}
                        {isAlreadyAssigned && (
                          <div className="text-xs text-orange-600 mt-1">Already assigned</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No available {selectedRole} members found
                </div>
              )}
            </div>
          )}

          {/* Selected Members for Assignment */}
          {selectedMembers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Selected Members for Assignment</h3>
              <div className="space-y-2">
                {selectedMembers.map((selected) => {
                  const member = availableMembers.find(m => m.id === selected.id);
                  return (
                    <div key={selected.id} className="flex items-center justify-between bg-blue-50 p-3 rounded border">
                      <div>
                        <div className="font-medium">{member?.name}</div>
                        <div className="text-sm text-gray-600">Role in Demo: {selected.role}</div>
                      </div>
                      <button
                        onClick={() => handleMemberSelect(selected.id, selected.role)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {selectedMembers.length > 0 && (
            <Button 
              variant="primary" 
              onClick={handleAssignMembers}
              disabled={loading}
            >
              {loading ? 'Assigning...' : `Assign ${selectedMembers.length} Member(s)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  demoBooking,
  assignments,
  onScheduleComplete
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null);
  const [agenda, setAgenda] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      const slots = await api.demoScheduling.getAvailableSlots(selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleDemo = async () => {
    if (!selectedSlot || assignments.length === 0) return;

    setLoading(true);
    try {
      // Get current user ID
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        console.error('No authenticated user found');
        return;
      }

      // Create Google Meet link
      const meetDetails = await DemoEmailService.createGoogleMeet(
        `Demo Session - ${demoBooking.company}`,
        `${selectedDate}T${selectedSlot.start_time}`,
        `${selectedDate}T${selectedSlot.end_time}`,
        [demoBooking.email, ...assignments.map(a => a.team_member?.email).filter(Boolean)]
      );
      
      const schedule = await api.demoScheduling.schedule({
        demo_booking_id: demoBooking.id,
        scheduled_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        timezone: 'UTC',
        google_meet_link: meetDetails.meetLink,
        google_event_id: meetDetails.eventId,
        agenda: agenda || `Demo session for ${demoBooking.product_interest}`,
        preparation_notes: preparationNotes,
        status: 'scheduled',
        created_by: currentUserId
      });

      // Send confirmation emails
      try {
        await DemoEmailService.sendScheduleConfirmationEmails(demoBooking, schedule, assignments);
        console.log('✅ Schedule confirmation emails sent');
        
        // Schedule reminder emails
        await DemoEmailService.scheduleReminderEmails(demoBooking, schedule, assignments);
        console.log('✅ Reminder emails scheduled');
      } catch (emailError) {
        console.warn('⚠️ Failed to send confirmation emails:', emailError);
      }
      
      onScheduleComplete();
      onClose();
    } catch (error) {
      console.error('Error scheduling demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-green-600" />
            Schedule Demo Session
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Check if team members are assigned */}
          {assignments.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Team Assignment Required</span>
              </div>
              <p className="mt-2 text-yellow-700">
                Please assign team members to this demo session before scheduling. 
                Click "Assign Team" to add team members first.
              </p>
            </div>
          ) : (
            <>
              {/* Assigned Team Members */}
              <div>
                <h3 className="font-semibold mb-3">Assigned Team Members</h3>
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{assignment.team_member?.name}</div>
                        <div className="text-sm text-gray-600">{assignment.role_in_demo} - {assignment.team_member?.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <h3 className="font-semibold mb-3">Available Time Slots</h3>
                  {loading ? (
                    <div className="text-center py-4">Loading available slots...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 border rounded-lg text-left transition-colors ${
                            selectedSlot?.id === slot.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-medium">{slot.slot_name}</div>
                          <div className="text-sm text-gray-600">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No available slots for this date
                    </div>
                  )}
                </div>
              )}

              {/* Meeting Details */}
              {selectedSlot && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Agenda
                    </label>
                    <textarea
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      placeholder={`Demo session for ${demoBooking.product_interest} with ${demoBooking.company}`}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Notes for Team
                    </label>
                    <textarea
                      value={preparationNotes}
                      onChange={(e) => setPreparationNotes(e.target.value)}
                      placeholder="Any special preparation notes for the team..."
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Meeting Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Meeting Summary</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div><strong>Date:</strong> {selectedDate}</div>
                      <div><strong>Time:</strong> {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</div>
                      <div><strong>Client:</strong> {demoBooking.name} ({demoBooking.email})</div>
                      <div><strong>Team Members:</strong> {assignments.length} assigned</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {assignments.length > 0 && selectedSlot && (
            <Button 
              variant="primary" 
              onClick={handleScheduleDemo}
              disabled={loading}
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export { TeamAssignmentModal, ScheduleModal };
