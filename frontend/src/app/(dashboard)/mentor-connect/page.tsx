"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Users, Star, X, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function MentorConnectPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering states
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [skillsList, setSkillsList] = useState<string[]>(["All"]);

  // Booking modal states
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("2026-05-30");
  const [bookingSlot, setBookingSlot] = useState("10:00 AM - 11:00 AM");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "paying" | "success">("idle");
  const [successMsg, setSuccessMsg] = useState("");

  // Toast message
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadMentors() {
      try {
        setLoading(true);
        const data = await api.getMentors();
        setMentors(data);
        setFilteredMentors(data);
        
        // Extract all unique skills
        const skillsSet = new Set<string>();
        data.forEach((m: any) => {
          m.skills?.forEach((s: string) => skillsSet.add(s));
        });
        setSkillsList(["All", ...Array.from(skillsSet)]);
      } catch (err: any) {
        console.error(err);
        setError("Failed to retrieve mentor directory.");
      } finally {
        setLoading(false);
      }
    }
    loadMentors();
  }, []);

  const handleFilter = (skill: string) => {
    setSelectedSkill(skill);
    if (skill === "All") {
      setFilteredMentors(mentors);
    } else {
      setFilteredMentors(mentors.filter((m) => m.skills?.includes(skill)));
    }
  };

  const handleConnect = async (mentorId: number) => {
    try {
      const res = await api.connectMentor(mentorId);
      showToast(res.message || "Connection request sent!");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to send connection request.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleBook = async () => {
    if (!selectedMentor) return;
    setBookingStatus("paying");
    
    // Simulate Razorpay popover verification
    setTimeout(async () => {
      try {
        const res = await api.bookMentor(selectedMentor.id, {
          amount: selectedMentor.hourly_rate_inr,
          date: bookingDate,
          time_slot: bookingSlot,
        });
        
        setBookingStatus("success");
        setSuccessMsg(res.message || "Session booked successfully!");
        showToast(`Booked session with ${selectedMentor.name}!`);
      } catch (err) {
        console.error(err);
        setBookingStatus("idle");
      }
    }, 2000);
  };

  const getNeonBg = (idx: number) => {
    const bgs = ["bg-[#FFFF00]", "bg-[#00FF66]", "bg-[#00FFCC]", "bg-[#FF66CC]"];
    return bgs[idx % bgs.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin rounded-none" />
        <p className="mt-4 font-black text-xs text-black tracking-wider uppercase animate-pulse">Syncing Mentor Catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FFFF00] text-black border-2 border-black px-6 py-4 rounded-none shadow-[4px_4px_0px_#000000] font-black text-xs uppercase tracking-wider flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-black shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Neobrutalist Block */}
      <div className="bg-black text-white p-8 rounded-none border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2">
        <h1 className="text-4xl font-display font-black tracking-tight uppercase flex items-center gap-3">
          <Users className="w-9 h-9 text-[#FFFF00] shrink-0" /> Mentor Connect
        </h1>
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
          Book 1:1 sessions with industry leaders to review your roadmap and practice code.
        </p>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2.5 bg-[#00FFCC] p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_#000000]">
        {skillsList.map((skill) => (
          <button
            key={skill}
            onClick={() => handleFilter(skill)}
            className={`px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer ${
              selectedSkill === skill
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-neutral-100"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      {/* Mentors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor, idx) => {
          const cardBg = getNeonBg(idx);
          return (
            <div
              key={mentor.id}
              className={`${cardBg} text-black rounded-none border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[340px] overflow-hidden`}
            >
              {/* Top Card Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Square avatar image */}
                  <div className="w-16 h-16 rounded-none overflow-hidden bg-white border-2 border-black shadow-[2px_2px_0px_#000000] shrink-0">
                    <img
                      src={mentor.avatar_url}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tight leading-none text-black">
                      {mentor.name}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-black mt-1.5">{mentor.title}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/70">@ {mentor.company}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-black bg-white border-2 border-black px-2 py-0.5 inline-flex shadow-[1px_1px_0px_#000000] w-fit">
                      <Star className="w-3.5 h-3.5 fill-current text-black shrink-0" />
                      <span>{mentor.rating}</span>
                      <span className="text-[9px] font-bold text-neutral-600 uppercase">({mentor.total_sessions} sess)</span>
                    </div>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {mentor.skills?.map((s: string, sIdx: number) => (
                    <span
                      key={sIdx}
                      className="bg-black text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-none border border-black"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions Area */}
              <div className="p-4 bg-white border-t-2 border-black flex items-center justify-between text-xs mt-auto">
                <div className="font-black text-sm uppercase tracking-wide">
                  {mentor.hourly_rate_inr === 0 ? (
                    <span className="bg-[#00FF66] text-black px-2.5 py-1 border-2 border-black shadow-[1px_1px_0px_#000000] font-extrabold uppercase">Free</span>
                  ) : (
                    <span>₹{mentor.hourly_rate_inr} <span className="text-[10px] font-normal text-neutral-500 uppercase tracking-widest">/ hr</span></span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleConnect(mentor.id)}
                    className="border-2 border-black hover:bg-neutral-100 text-black px-3 py-2 rounded-none transition-all bg-white font-black uppercase text-[10px] shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setBookingStatus("idle");
                    }}
                    className="bg-black text-white border-2 border-black hover:bg-neutral-850 px-4 py-2 rounded-none font-black uppercase text-[10px] shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                  >
                    Book Slot
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-none border-4 border-black shadow-[8px_8px_0px_#000000] max-w-md w-full relative overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-4 right-4 bg-white border-2 border-black text-black hover:bg-black hover:text-white p-1 rounded-none shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="p-6 border-b-2 border-black bg-[#FFFF00] text-black">
              <h3 className="font-display font-black text-xl uppercase tracking-tight leading-none">Book 1:1 Consultation</h3>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-800 mt-1.5">Scheduling session with {selectedMentor.name}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-bold text-black">
              {bookingStatus === "idle" && (
                <>
                  {/* Select Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">Choose Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-white border-2 border-black px-3.5 py-2.5 rounded-none text-xs font-black text-black uppercase tracking-wider focus:outline-none focus:bg-neutral-50 transition-colors"
                    />
                  </div>

                  {/* Select Slot */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">Choose Time Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "10:00 AM - 11:00 AM",
                        "01:00 PM - 02:00 PM",
                        "03:00 PM - 04:00 PM",
                        "05:00 PM - 06:00 PM",
                      ].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setBookingSlot(slot)}
                          className={`p-2.5 rounded-none border-2 border-black text-center transition-all font-black text-[10px] uppercase shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer ${
                            bookingSlot === slot
                              ? "bg-black text-white"
                              : "bg-white text-black hover:bg-neutral-100"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-t-2 border-black my-4" />

                  {/* Price info */}
                  <div className="flex justify-between items-center bg-[#00FFCC] p-4 rounded-none border-2 border-black shadow-[2px_2px_0px_#000000]">
                    <span className="text-black font-black uppercase text-[10px] tracking-wider">Total Booking Price:</span>
                    <span className="text-black font-black text-lg uppercase tracking-wide">
                      {selectedMentor.hourly_rate_inr === 0 ? "₹0 (Free)" : `₹${selectedMentor.hourly_rate_inr}`}
                    </span>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handleBook}
                    className="w-full bg-[#FF66CC] text-black border-2 border-black hover:bg-[#FF3399] py-3.5 rounded-none font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer mt-4"
                  >
                    Confirm & Book via Razorpay
                  </button>
                </>
              )}

              {bookingStatus === "paying" && (
                <div className="py-10 text-center space-y-4">
                  {/* simulated payment spinner */}
                  <div className="w-12 h-12 border-4 border-black border-t-[#FFFF00] animate-spin rounded-none mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-wider">Verifying Razorpay Gateway</h4>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider leading-relaxed">
                      Please do not refresh the page. Processing token transactions secure hash...
                    </p>
                  </div>
                </div>
              )}

              {bookingStatus === "success" && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-[#00FF66] text-black border-2 border-black rounded-none flex items-center justify-center mx-auto shadow-[2px_2px_0px_#000000]">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-black uppercase tracking-tight">Payment Verified!</h4>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider leading-relaxed">
                      Successfully scheduled call for {bookingDate} at {bookingSlot}.
                    </p>
                  </div>
                  <div className="bg-[#00FFCC] p-3.5 rounded-none select-all border-2 border-black text-center font-mono text-[10px] break-all text-black shadow-[2px_2px_0px_#000000]">
                    Join Meeting: https://meet.google.com/xyz-mock-call
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMentor(null);
                      setBookingStatus("idle");
                    }}
                    className="w-full bg-black text-white border-2 border-black hover:bg-neutral-850 py-3 rounded-none font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
