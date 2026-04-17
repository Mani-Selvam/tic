import React, { useEffect, useState, useRef } from "react";
import {
    getWorkerAssignedTickets,
    getWorkerWorkAnalysis,
} from "@/Components/Api/TicketApi/workerAPI";
import { getMaterialApprovedAnalysis } from "@/Components/Api/TicketApi/workAnalysisAPI";
import { updateTicket, getTickets } from "@/Components/Api/TicketApi/ticketAPI";
import { getTicketStatuses } from "@/Components/Api/MasterApi/ticketStatusApi";
import { createWorkLog, getWorkLogsByAnalysis } from "@/Components/Api/TicketApi/workLogAPI";
import { API_ENDPOINTS } from "../../config/apiConfig";
import WorkAnalysisForm from "./WorkAnalysisForm";
import "./ticketForm.css";
import mapIcon from "../../assets/map.png";

// --- SVG Icons ---
const SearchIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const CloseIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CheckIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const FileTextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const BuildingIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <rect x="3" y="2" width="18" height="20" rx="2" ry="2"></rect>
        <line x1="9" y1="2" x2="9" y2="22"></line>
        <line x1="15" y1="2" x2="15" y2="22"></line>
        <line x1="3" y1="7" x2="21" y2="7"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
    </svg>
);

const UserIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const CalendarIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

// New Icons for Buttons
const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const ListIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-20 0v-1a10 10 0 1 1 20 0z"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const CameraIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

const MaterialApprovedPage = () => {
    const [workAnalyses, setWorkAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [selectedAnalysisToView, setSelectedAnalysisToView] = useState(null);
    const [showWorkLogForm, setShowWorkLogForm] = useState(false);
    const [selectedAnalysisForLog, setSelectedAnalysisForLog] = useState(null);
    const [showViewLog, setShowViewLog] = useState(false);
    const [workLogs, setWorkLogs] = useState([]);
    const [ticketStatuses, setTicketStatuses] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    
    // Initialize timers from localStorage
    const [timers, setTimers] = useState(() => {
        try {
            const saved = localStorage.getItem('materialApprovedPageTimers');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Convert ISO strings back to Date objects
                const restored = {};
                Object.keys(parsed).forEach(key => {
                    restored[key] = {
                        ...parsed[key],
                        startTime: parsed[key].startTime ? new Date(parsed[key].startTime) : null,
                        endTime: parsed[key].endTime ? new Date(parsed[key].endTime) : null,
                        systemStartTime: parsed[key].systemStartTime ? new Date(parsed[key].systemStartTime) : null
                    };
                });
                return restored;
            }
        } catch (e) {
            console.warn("Failed to restore timers from localStorage:", e);
        }
        return {};
    });
    
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showCompleteWorkModal, setShowCompleteWorkModal] = useState(false);
    const [selectedAnalysisForCompletion, setSelectedAnalysisForCompletion] = useState(null);
    const [completeWorkImages, setCompleteWorkImages] = useState([]);
    const [completeWorkImagePreviews, setCompleteWorkImagePreviews] = useState([]);
    
    // Desktop camera support
    const [showWebcamModal, setShowWebcamModal] = useState(false);
    const [webcamStream, setWebcamStream] = useState(null);
    const [showCameraMenu, setShowCameraMenu] = useState(false);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const workerId = user?.id;

    // Save timers to localStorage whenever they change
    React.useEffect(() => {
        try {
            localStorage.setItem('materialApprovedPageTimers', JSON.stringify(timers));
        } catch (e) {
            console.warn("Failed to save timers to localStorage:", e);
        }
    }, [timers]);

    // Inject blink CSS for location highlight
    React.useEffect(() => {
        if (typeof document === 'undefined') return;
        if (document.getElementById('map-blink-style')) return;
        const style = document.createElement('style');
        style.id = 'map-blink-style';
        style.textContent = `
            /* Removed blink animation — use a simple map icon above the location text */
            .location-link {
                background: none;
                border: none;
                padding: 0;
                margin: 0;
                font: inherit;
                color: inherit;
                text-align: left;
                cursor: pointer;
            }
            .map-icon-btn {
                background: none;
                border: none;
                padding: 0;
                margin: 0 0 6px 0;
                font-size: 18px;
                line-height: 1;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }, []);

    const openMap = (query) => {
        if (!query) return;
        // Try to get user's current position to use as origin
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(query)}&travelmode=driving`;
                    window.open(url, '_blank');
                },
                (err) => {
                    // If user denies or error, open directions with only destination (Maps will use current location if available)
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
                    window.open(url, '_blank');
                    showToast('Opened directions without start location', 'info');
                },
                { timeout: 5000 }
            );
        } else {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
            window.open(url, '_blank');
        }
    };

    useEffect(() => {
        const initPage = async () => {
            setLoading(true);
            try {
                const statuses = await getTicketStatuses();
                setTicketStatuses(statuses || []);
                
                if (workerId) {
                    await fetchWorkAnalyses();
                }
            } finally {
                setLoading(false);
            }
        };
        initPage();
    }, [workerId]);

    // Update current time every second
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    const fetchWorkAnalyses = async () => {
        try {
            const data = await getMaterialApprovedAnalysis();
            const approvedAnalyses = Array.isArray(data) ? data : data.data || [];

            // Enrich analyses with full ticket objects so fields like `location` are available
            try {
                const allTicketsRes = await getTickets(false);
                const ticketsArray = Array.isArray(allTicketsRes) ? allTicketsRes : allTicketsRes.data || [];
                const ticketMap = new Map((ticketsArray || []).map(t => [String(t._id), t]));

                const enriched = approvedAnalyses.map((a) => {
                    const ticketId = a.ticket_id?._id || a.ticket_id;
                    const fullTicket = ticketMap.get(String(ticketId)) || a.ticket_id;
                    return { ...a, ticket_id: fullTicket };
                });

                setWorkAnalyses(enriched);
            } catch (err) {
                console.warn('Could not enrich analyses with tickets:', err);
                setWorkAnalyses(approvedAnalyses);
            }
        } catch (error) {
            console.error("Error fetching Material Approved analyses:", error);
            showToast("Failed to load Material Approved analyses", "error");
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type }), 3000);
    };

    // Calculate total logged time for current user
    const calculateTotalLoggedTime = () => {
        let totalSeconds = 0;
        const currentUserName = (user?.name || "").toLowerCase().trim();
        
        workAnalyses.forEach(analysis => {
            workLogs.forEach(log => {
                const logMatches = String(log.analysis_id) === String(analysis._id) && 
                                  ((log.worker_name || "").toLowerCase().trim() === currentUserName ||
                                   String(log.worker_id || "") === String(user?.id || ""));
                
                if (logMatches) {
                    // Parse duration like "0h 5m 30s"
                    const durationStr = String(log.duration || "").trim();
                    const durationParts = durationStr.match(/(\d+)h\s*(\d+)m\s*(\d+)s/i);
                    if (durationParts && durationParts.length >= 4) {
                        const hours = parseInt(durationParts[1]) || 0;
                        const minutes = parseInt(durationParts[2]) || 0;
                        const seconds = parseInt(durationParts[3]) || 0;
                        totalSeconds += hours * 3600 + minutes * 60 + seconds;
                    }
                }
            });
        });
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Calculate total logged time for a specific ticket/analysis for the current logged-in user
    const calculateTicketTotalTime = (analysisId) => {
        let totalSeconds = 0;
        const currentUserName = (user?.name || "").toLowerCase().trim();
        
        workLogs.forEach(log => {
            const logMatches = String(log.analysis_id) === String(analysisId) && 
                              ((log.worker_name || "").toLowerCase().trim() === currentUserName ||
                               String(log.worker_id || "") === String(user?.id || ""));
            
            if (logMatches) {
                // Parse duration like "0h 5m 30s"
                const durationStr = String(log.duration || "").trim();
                const durationParts = durationStr.match(/(\d+)h\s*(\d+)m\s*(\d+)s/i);
                if (durationParts && durationParts.length >= 4) {
                    const hours = parseInt(durationParts[1]) || 0;
                    const minutes = parseInt(durationParts[2]) || 0;
                    const seconds = parseInt(durationParts[3]) || 0;
                    totalSeconds += hours * 3600 + minutes * 60 + seconds;
                }
            }
        });
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const loadWorkLogs = async (analysisId) => {
        try {
            setLoadingLogs(true);
            const logs = await getWorkLogsByAnalysis(analysisId);
            setWorkLogs(logs || []);
        } catch (error) {
            console.error("Error loading work logs:", error);
            showToast("Failed to load work logs: " + error.message, "error");
            setWorkLogs([]);
        } finally {
            setLoadingLogs(false);
        }
    };

    // Fetch full ticket data to populate all fields in the modal
    const handleViewAnalysisDetails = async (analysis) => {
        try {
            // Try to fetch all tickets and find the matching one
            const allTickets = await getTickets(false);
            const ticketsArray = Array.isArray(allTickets) ? allTickets : allTickets.data || [];
            
            // Find the matching ticket by ID
            const ticketId = analysis.ticket_id?._id || analysis.ticket_id;
            const fullTicket = ticketsArray.find(t => String(t._id) === String(ticketId));
            
            // Merge the full ticket data with the analysis
            const enrichedAnalysis = {
                ...analysis,
                ticket_id: fullTicket || analysis.ticket_id
            };
            
            setSelectedAnalysisToView(enrichedAnalysis);
        } catch (error) {
            console.error("Error fetching full ticket details:", error);
            // If fetch fails, just use the analysis as-is
            setSelectedAnalysisToView(analysis);
            showToast("Could not load full ticket details", "error");
        }
    };

    const calculateDuration = (fromTime, toTime) => {
        if (!fromTime || !toTime) return "0h 0m 0s";
        
        // Convert to Date objects if they're strings
        const fromDate = typeof fromTime === 'string' ? new Date(fromTime) : fromTime;
        const toDate = typeof toTime === 'string' ? new Date(toTime) : toTime;
        
        const fromMs = fromDate.getTime();
        const toMs = toDate.getTime();
        const diffMs = toMs - fromMs;
        
        // Calculate hours, minutes, and seconds
        const diffSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const handleStartTimer = async () => {
        try {
            // Just start the timer without changing ticket status
            // Status will only change when work is completed
            const analysisId = selectedAnalysisForLog._id;
            const now = new Date();
            setTimers(prev => ({
                ...prev,
                [analysisId]: {
                    startTime: now,
                    endTime: null,
                    isRunning: true,
                    duration: "0h 0m"
                }
            }));
            console.log("✅ Timer started for analysis", analysisId, "at:", now.toLocaleTimeString());
            showToast("⏱️ Timer started!", "success");
            
        } catch (error) {
            console.error("Error starting timer:", error);
            showToast("Failed to start timer: " + (error.response?.data?.message || error.message), "error");
        }
    };

    const handleEndTimer = async () => {
        if (!selectedAnalysisForLog) return;
        const analysisId = selectedAnalysisForLog._id;
        const timerData = timers[analysisId];
        if (!timerData || !timerData.startTime) return;
        
        const now = new Date();
        const duration = calculateDuration(timerData.startTime, now);
        
        const updatedTimerData = {
            ...timerData,
            endTime: now,
            isRunning: false,
            duration: duration
        };
        
        setTimers(prev => ({
            ...prev,
            [analysisId]: updatedTimerData
        }));
        console.log("🛑 Timer ended for analysis", analysisId, "at:", now.toLocaleTimeString(), "Duration:", duration);
        
        // Automatically submit work log after ending timer with the complete timer data
        showToast("Timer ended! Submitting work log...", "success");
        
        // Pass the timer data directly to avoid state sync issues
        setTimeout(() => {
            handleSubmitWorkLogAuto(updatedTimerData);
        }, 300);
    };

    const handleSubmitWorkLogAuto = async (timerData) => {
        if (!selectedAnalysisForLog) return;
        
        const analysisId = selectedAnalysisForLog._id;
        
        if (!timerData || !timerData.startTime || !timerData.endTime) {
            console.error("Timer data incomplete:", timerData);
            showToast("Timer data incomplete", "error");
            return;
        }

        try {
            // Format time strings (HH:MM)
            const startTimeDate = timerData.startTime instanceof Date ? timerData.startTime : new Date(timerData.startTime);
            const endTimeDate = timerData.endTime instanceof Date ? timerData.endTime : new Date(timerData.endTime);
            
            const fromTimeStr = startTimeDate.getHours().toString().padStart(2, '0') + ':' + 
                               startTimeDate.getMinutes().toString().padStart(2, '0');
            const toTimeStr = endTimeDate.getHours().toString().padStart(2, '0') + ':' + 
                             endTimeDate.getMinutes().toString().padStart(2, '0');
            const dateStr = startTimeDate.toISOString().split('T')[0];
            
            const workLogData = {
                ticket_id: selectedAnalysisForLog.ticket_id?._id,
                analysis_id: selectedAnalysisForLog._id,
                worker_id: user?.id,
                worker_name: user?.name || selectedAnalysisForLog.worker_name,
                from_time: fromTimeStr,
                to_time: toTimeStr,
                duration: timerData.duration,
                log_date: dateStr,
            };

            console.log("📝 Submitting work log:", workLogData);
            const savedLog = await createWorkLog(workLogData);
            console.log("🟢 Saved Work Log:", savedLog);
            showToast("Work log submitted successfully!", "success");

            // Refresh and open Work Logs view so user can verify the saved entry
            try {
                await loadWorkLogs(selectedAnalysisForLog._id);
                setShowViewLog(true);
            } catch (e) {
                console.warn("Could not auto-open work logs view:", e.message || e);
            }

            const ticket = selectedAnalysisForLog.ticket_id;
            const ticketId = ticket._id;
            const statusName = "Working In Progress";
            
            let statusId = null;
            let statusObj = null;
            if (ticketStatuses && ticketStatuses.length > 0) {
                statusObj = ticketStatuses.find((s) => String(s.name).toLowerCase() === String(statusName).toLowerCase());
                statusId = statusObj?._id || statusObj?.id || null;
            }
            
            const updatePayload = statusId ? { status_id: statusId } : { status: statusName };
            await updateTicket(ticketId, updatePayload);
            
            showToast("Ticket status updated to Working In Progress", "success");
            
            // Reset timer for this analysis
            setShowWorkLogForm(false);
            setTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[analysisId];
                return newTimers;
            });
            
            setTimeout(() => {
                fetchWorkAnalyses();
            }, 500);
            
        } catch (error) {
            console.error("Error submitting work log:", error);
            showToast("Failed to submit work log: " + error.message, "error");
        }
    };

    const handleSubmitWorkLog = async () => {
        if (!selectedAnalysisForLog) return;
        
        const analysisId = selectedAnalysisForLog._id;
        const timerData = timers[analysisId];
        
        if (!timerData || !timerData.startTime || !timerData.endTime) {
            showToast("Please start and end the timer", "error");
            return;
        }

        try {
            // Format time strings (HH:MM)
            const fromTimeStr = timerData.startTime.getHours().toString().padStart(2, '0') + ':' + 
                               timerData.startTime.getMinutes().toString().padStart(2, '0');
            const toTimeStr = timerData.endTime.getHours().toString().padStart(2, '0') + ':' + 
                             timerData.endTime.getMinutes().toString().padStart(2, '0');
            const dateStr = timerData.startTime.toISOString().split('T')[0];
            
            const workLogData = {
                ticket_id: selectedAnalysisForLog.ticket_id?._id,
                analysis_id: selectedAnalysisForLog._id,
                worker_id: user?.id,
                worker_name: user?.name || selectedAnalysisForLog.worker_name,
                from_time: fromTimeStr,
                to_time: toTimeStr,
                duration: timerData.duration,
                log_date: dateStr,
            };

            const savedLog = await createWorkLog(workLogData);
            console.log("🟢 Saved Work Log:", savedLog);
            showToast("Work log submitted successfully!", "success");

            // Refresh and open Work Logs view so user can verify the saved entry
            try {
                await loadWorkLogs(selectedAnalysisForLog._id);
                setShowViewLog(true);
            } catch (e) {
                console.warn("Could not auto-open work logs view:", e.message || e);
            }

            const ticket = selectedAnalysisForLog.ticket_id;
            const ticketId = ticket._id;
            const statusName = "Working In Progress";
            
            let statusId = null;
            let statusObj = null;
            if (ticketStatuses && ticketStatuses.length > 0) {
                statusObj = ticketStatuses.find((s) => String(s.name).toLowerCase() === String(statusName).toLowerCase());
                statusId = statusObj?._id || statusObj?.id || null;
            }
            
            const updatePayload = statusId ? { status_id: statusId } : { status: statusName };
            await updateTicket(ticketId, updatePayload);
            
            showToast("Ticket status updated to Working In Progress", "success");
            
            // Reset timer for this analysis
            setShowWorkLogForm(false);
            setTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[analysisId];
                return newTimers;
            });
            
            setTimeout(() => {
                fetchWorkAnalyses();
            }, 500);
            
        } catch (error) {
            console.error("Error submitting work log:", error);
            showToast("Failed to submit work log: " + error.message, "error");
        }
    };

    const handleCompleteWork = async (analysis) => {
        try {
            const ticket = analysis.ticket_id;
            if (!ticket || !ticket._id) {
                showToast("No ticket found for this analysis", "error");
                return;
            }
            
            // Open the completion form modal
            setSelectedAnalysisForCompletion(analysis);
            setCompleteWorkImages([]);
            setCompleteWorkImagePreviews([]);
            setShowCompleteWorkModal(true);
            
        } catch (error) {
            console.error("Error opening complete work form:", error);
            showToast("Failed to open completion form: " + error.message, "error");
        }
    };

    const handleCompleteWorkImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        setCompleteWorkImages(files);
        
        // Create previews
        const previews = files.map(file => URL.createObjectURL(file));
        setCompleteWorkImagePreviews(previews);
    };

    // Camera handlers - simple click triggers for static input elements
    const handleOpenRearCamera = () => {
        const input = document.getElementById('cameraInputRear');
        if (input) {
            input.click();
            setShowCameraMenu(false);
        }
    };

    const handleOpenFrontCamera = () => {
        const input = document.getElementById('cameraInputFront');
        if (input) {
            input.click();
            setShowCameraMenu(false);
        }
    };

    const handleOpenGallery = () => {
        const input = document.getElementById('cameraInputGallery');
        if (input) {
            input.click();
            setShowCameraMenu(false);
        }
    };

    const handleOpenDesktopWebcam = () => {
        startWebcam();
        setShowCameraMenu(false);
    };

    const handleOpenCamera = () => {
        setShowCameraMenu(true);
    };

    // Desktop Webcam Support
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            setWebcamStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowWebcamModal(true);
            console.log("✅ Webcam started");
        } catch (error) {
            console.error("❌ Webcam error:", error);
            if (error.name === 'NotAllowedError') {
                showToast("Camera permission denied. Please allow camera access.", "error");
            } else if (error.name === 'NotFoundError') {
                showToast("No camera device found on this computer.", "error");
            } else {
                showToast("Could not access webcam: " + error.message, "error");
            }
        }
    };

    const captureWebcamPhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            
            // Convert canvas to blob and add to images
            canvasRef.current.toBlob((blob) => {
                const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' });
                const preview = canvasRef.current.toDataURL('image/jpeg');
                
                setCompleteWorkImages(prev => [...prev, file]);
                setCompleteWorkImagePreviews(prev => [...prev, preview]);
                
                showToast("✅ Photo captured successfully!", "success");
                console.log("📸 Webcam photo captured");
            }, 'image/jpeg', 0.95);
        }
    };

    const stopWebcam = () => {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            setWebcamStream(null);
            setShowWebcamModal(false);
            console.log("🛑 Webcam stopped");
        }
    };

    // Cleanup webcam when modal closes
    useEffect(() => {
        return () => {
            if (webcamStream && !showWebcamModal) {
                webcamStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [showWebcamModal, webcamStream]);

    const handleSubmitCompleteWork = async () => {
        try {
            if (!selectedAnalysisForCompletion) return;
            
            const ticket = selectedAnalysisForCompletion.ticket_id;
            const ticketId = ticket._id;
            const statusName = "Work Completed";
            
            let statusId = null;
            let statusObj = null;
            const statusesToSearch = (ticketStatuses && ticketStatuses.length > 0) ? ticketStatuses : await getTicketStatuses();
            
            if (statusesToSearch && statusesToSearch.length > 0) {
                statusObj = statusesToSearch.find((s) => String(s.name).toLowerCase() === String(statusName).toLowerCase());
                statusId = statusObj?._id || statusObj?.id || null;
            }
            
            const updatePayload = statusId ? { status_id: statusId } : { status: statusName };
            
            showToast("Updating ticket status to 'Work Completed'...", "success");
            await updateTicket(ticketId, updatePayload);
            
            showToast("✅ Work marked as completed!", "success");
            
            // Close modal and reset
            setShowCompleteWorkModal(false);
            setSelectedAnalysisForCompletion(null);
            setCompleteWorkImages([]);
            setCompleteWorkImagePreviews([]);
            
            setTimeout(() => {
                fetchWorkAnalyses();
            }, 500);
            
        } catch (error) {
            console.error("Error completing work:", error);
            showToast("Failed to complete work: " + (error.response?.data?.message || error.message), "error");
        }
    };

    const getStatusStyle = (statusName) => {
        const n = String(statusName).toLowerCase();
        let bgColor = "#dbeafe";
        let textColor = "#1e40af";

        if (n.includes("closed")) {
            bgColor = "#f3f4f6";
            textColor = "#4b5563";
        } else if (n.includes("progress")) {
            bgColor = "#e0e7ff";
            textColor = "#3730a3";
        } else if (n.includes("resolved")) {
            bgColor = "#dcfce7";
            textColor = "#166534";
        } else if (n.includes("material approved")) {
            bgColor = "#dcfce7";
            textColor = "#166534";
        }

        return { backgroundColor: bgColor, color: textColor };
    };

    const filteredAnalyses = workAnalyses.filter((analysis) => {
        const term = searchTerm.toLowerCase();
        const id = String(analysis.analysis_id || "").toLowerCase();
        const ticketId = String(analysis.ticket_id?.ticket_id || "").toLowerCase();
        const desc = String(analysis.material_description || "").toLowerCase();
        return id.includes(term) || ticketId.includes(term) || desc.includes(term);
    });

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.spinnerContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading Material Approved records...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            {/* --- Professional Page Header --- */}
            <div style={styles.headerSection}>
               
                <div style={styles.statsBadge}>
                    <span style={styles.statsCount}>{filteredAnalyses.length}</span>
                    <span style={styles.statsLabel}>Records Found</span>
                </div>
                  {/* --- Search Bar --- */}
            <div style={styles.searchWrapper}>
                <div style={styles.searchInputWrapper}>
                    <span style={styles.searchIcon}>
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        placeholder="Search "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>
            </div>

            {/* --- Toast Notification --- */}
            {toast.show && (
                <div
                    style={{
                        ...styles.toast,
                        ...(toast.type === "error"
                            ? styles.toastError
                            : styles.toastSuccess),
                    }}>
                    <div style={styles.toastContent}>
                        {toast.type === "success" ? <CheckIcon /> : <span style={styles.errorIcon}>⚠</span>}
                        <span style={styles.toastMessage}>{toast.message}</span>
                    </div>
                    <button style={styles.toastClose} onClick={() => setToast({ show: false, message: "", type: "" })}>
                        <CloseIcon />
                    </button>
                </div>
            )}

            {/* --- Analysis View Modal --- */}
            {selectedAnalysisToView && (
                <div style={styles.modalOverlay} onClick={() => setSelectedAnalysisToView(null)}>
                    <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={styles.iconCircle}>
                                    <FileTextIcon />
                                </div>
                                <h3 style={styles.modalTitle}>Analysis Details</h3>
                            </div>
                            <button onClick={() => setSelectedAnalysisToView(null)} style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            {/* --- Section 1: Ticket Information --- */}
                            <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "8px", border: "1px solid #bbf7d0", marginBottom: "24px" }}>
                                <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#166534", display: "flex", alignItems: "center", gap: "8px" }}>
                                    🎫 Ticket Information
                                </h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <h5 style={styles.detailLabel}>Ticket ID</h5>
                                        <p style={styles.detailValue}>{selectedAnalysisToView.ticket_id?.ticket_id || "-"}</p>
                                    </div>
                                    <div>
                                        <h5 style={styles.detailLabel}>Title</h5>
                                        <p style={styles.detailValue}>{selectedAnalysisToView.ticket_id?.title || "-"}</p>
                                    </div>
                                    <div>
                                        <h5 style={styles.detailLabel}>Department</h5>
                                        <p style={styles.detailValue}>{selectedAnalysisToView.ticket_id?.department_id?.name || "-"}</p>
                                    </div>
                                    <div>
                                        <h5 style={styles.detailLabel}>Company</h5>
                                        <p style={styles.detailValue}>{selectedAnalysisToView.ticket_id?.company_id?.name || "-"}</p>
                                    </div>
                                    <div>
                                        <h5 style={styles.detailLabel}>Location</h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <button
                                                className="location-link map-icon-btn"
                                                onClick={() => openMap(selectedAnalysisToView.ticket_id?.location || selectedAnalysisToView.location || selectedAnalysisToView.ticket_location)}
                                                title={selectedAnalysisToView.ticket_id?.location || selectedAnalysisToView.location || selectedAnalysisToView.ticket_location || 'Open in Maps'}
                                                aria-label="Open in Maps"
                                            >
                                                🗺️
                                            </button>
                                            <div style={{ ...styles.detailValue, padding: 0, textAlign: 'left' }}>
                                                {selectedAnalysisToView.ticket_id?.location || selectedAnalysisToView.location || selectedAnalysisToView.ticket_location || "-"}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 style={styles.detailLabel}>Priority</h5>
                                        <p style={styles.detailValue}>{selectedAnalysisToView.ticket_id?.priority_id?.name || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* --- Section 2: Ticket Description --- */}
                            {selectedAnalysisToView.ticket_id?.description && (
                                <div style={{ background: "#f0f9ff", padding: "20px", borderRadius: "8px", border: "1px solid #bae6fd", marginBottom: "24px" }}>
                                    <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "700", color: "#0c4a6e", display: "flex", alignItems: "center", gap: "8px" }}>
                                        📝 Ticket Description
                                    </h4>
                                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
                                        {selectedAnalysisToView.ticket_id.description}
                                    </p>
                                </div>
                            )}

                            {/* --- Section 3: Analysis Details --- */}
                            <div style={{ background: "#fef3c7", padding: "20px", borderRadius: "8px", border: "1px solid #fcd34d", marginBottom: "24px" }}>
                                <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
                                    🔍 Analysis Details
                                </h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <h5 style={styles.detailLabel}>Analysis ID</h5>
                                        <p style={styles.detailValue}>{selectedAnalysisToView.analysis_id || selectedAnalysisToView._id}</p>
                                    </div>
                                    <div>
                                        <h5 style={styles.detailLabel}>Material Required</h5>
                                        <p style={styles.detailValue}>{selectedAnalysisToView.material_required || "-"}</p>
                                    </div>
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <h5 style={styles.detailLabel}>Material Description</h5>
                                        <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#334155", lineHeight: "1.5" }}>
                                            {selectedAnalysisToView.material_description || "No description provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* --- Section 4: Status Information --- */}
                            <div style={{ background: "#f3e8ff", padding: "20px", borderRadius: "8px", border: "1px solid #e9d5ff", marginBottom: "24px" }}>
                                <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#6b21a8", display: "flex", alignItems: "center", gap: "8px" }}>
                                    ✓ Status Information
                                </h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <h5 style={styles.detailLabel}>Ticket Status</h5>
                                        {(() => {
                                            const ticketStatus = selectedAnalysisToView.ticket_id?.status_id?.name || selectedAnalysisToView.ticket_id?.status || "Unknown";
                                            return (
                                                <span style={{
                                                    display: "inline-block",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                    textTransform: "uppercase",
                                                    ...getStatusStyle(ticketStatus)
                                                }}>
                                                    {ticketStatus}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div>
                                        <h5 style={styles.detailLabel}>Analysis Status</h5>
                                        <span style={{
                                            display: "inline-block",
                                            background: "#dcfce7",
                                            color: "#166534",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            textTransform: "uppercase"
                                        }}>
                                            Approved
                                        </span>
                                    </div>
                                    <div>
                                        <h5 style={styles.detailLabel}>Worker Name</h5>
                                        <p style={styles.detailValue}>{user?.name || selectedAnalysisToView.worker_name || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* --- Section 5: Dates --- */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                                <div>
                                    <h5 style={styles.detailLabel}>📅 Created On</h5>
                                    <p style={styles.detailValue}>
                                        {new Date(selectedAnalysisToView.created_at || selectedAnalysisToView.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <h5 style={styles.detailLabel}>⏱️ Last Updated</h5>
                                    <p style={styles.detailValue}>
                                        {new Date(selectedAnalysisToView.updated_at || selectedAnalysisToView.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* --- Section 6: Uploaded Images --- */}
                            {selectedAnalysisToView.uploaded_images && selectedAnalysisToView.uploaded_images.length > 0 && (
                                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                    <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                                        🖼️ Uploaded Images ({selectedAnalysisToView.uploaded_images.length})
                                    </h4>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
                                        {selectedAnalysisToView.uploaded_images.map((img, i) => {
                                            const normalized = img && typeof img === "string" ? img.replace(/\\/g, "/") : img;
                                            const src = normalized && normalized.startsWith("http") ? normalized : `${API_ENDPOINTS.BASE_URL}/${normalized}`;
                                            return (
                                                <div key={i} style={{ position: "relative" }}>
                                                    <img 
                                                        src={src} 
                                                        alt={`analysis-${i}`} 
                                                        style={{ 
                                                            width: "100%", 
                                                            height: "120px", 
                                                            objectFit: "cover", 
                                                            borderRadius: "8px", 
                                                            border: "1px solid #e2e8f0", 
                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s"
                                                        }}
                                                        title={`Image ${i + 1}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- Edit Form Modal (Work Log) --- */}
            {showWorkLogForm && selectedAnalysisForLog && (() => {
                const analysisId = selectedAnalysisForLog._id;
                const timerData = timers[analysisId] || { startTime: null, endTime: null, isRunning: false, duration: "0h 0m" };
                
                return (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalMedium} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h3 style={styles.modalTitle}>Time Tracker - Auto Timer</h3>
                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>Ticket: <strong>{selectedAnalysisForLog.ticket_id?.ticket_id}</strong> <span style={{ marginLeft: 8 }}>| Worker: <strong>{user?.name || selectedAnalysisForLog.worker_name}</strong></span></p>
                            </div>
                            <button onClick={() => setShowWorkLogForm(false)} style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                           

                            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
                                {/* Timer Status Display */}
                                <div style={{ marginBottom: "24px", padding: "16px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", ...(timerData.isRunning ? { borderColor: "#86efac", borderWidth: "2px" } : {}) }} className={timerData.isRunning ? "timer-running-pulse" : ""}>
                                    {timerData.isRunning && (
                                        <div className="timer-running-glow" style={{ marginBottom: "16px", padding: "12px 16px", background: "#dcfce7", borderRadius: "6px", border: "1px solid #86efac", borderLeft: "4px solid #10b981", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ fontSize: "20px" }}>⏱️</span>
                                            <p style={{ margin: 0, fontSize: "13px", color: "#166534", fontWeight: "600" }}>Timer is running...</p>
                                        </div>
                                    )}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                        <div>
                                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Start Time</p>
                                            <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: timerData.startTime ? "#10b981" : "#94a3b8" }}>
                                                {timerData.startTime ? timerData.startTime.toLocaleTimeString() : "-- : -- : --"}
                                            </p>
                                            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                                                {timerData.startTime ? timerData.startTime.toLocaleDateString() : "Not started"}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>End Time</p>
                                            <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: timerData.endTime ? "#ef4444" : "#94a3b8" }}>
                                                {timerData.endTime ? timerData.endTime.toLocaleTimeString() : "-- : -- : --"}
                                            </p>
                                            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                                                {timerData.endTime ? timerData.endTime.toLocaleDateString() : "Not ended"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Duration Display */}
                                    <div style={{ padding: "12px 16px", background: "#eff6ff", borderRadius: "6px", border: "1px solid #bfdbfe", borderLeft: "4px solid #3b82f6" }}>
                                        <p style={{ margin: 0, fontSize: "13px", color: "#0c4a6e" }}>
                                            <span style={{ fontWeight: "600" }}>Total Duration:</span>
                                            <span style={{ marginLeft: "8px", fontSize: "16px", fontWeight: "700", color: "#2563eb" }}>{timerData.duration}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Control Buttons */}
                                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                    {!timerData.startTime ? (
                                        // No timer started yet: Show Start button
                                        <button 
                                            onClick={handleStartTimer}
                                            style={{
                                                ...styles.btnPrimary,
                                                flex: 1,
                                                padding: "14px 24px",
                                                fontSize: "15px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                background: "#10b981",
                                            }}>
                                            <span style={{ fontSize: "20px" }}>▶</span>
                                            Start Timer
                                        </button>
                                    ) : !timerData.endTime ? (
                                        // Timer running: Show End button
                                        <button 
                                            onClick={handleEndTimer}
                                            style={{
                                                ...styles.btnPrimary,
                                                flex: 1,
                                                padding: "14px 24px",
                                                fontSize: "15px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                background: "#ef4444",
                                            }}>
                                            <span style={{ fontSize: "20px" }}>⏹</span>
                                            End Timer
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            {/* Cancel Button */}
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                <button onClick={() => setShowWorkLogForm(false)} style={styles.btnSecondary}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* --- View Work Log Modal --- */}
            {showViewLog && selectedAnalysisForLog && (
                <div style={styles.modalOverlay} onClick={() => setShowViewLog(false)}>
                    <div style={styles.modalMedium} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h3 style={styles.modalTitle}>Work Log Records</h3>
                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>Ticket: <strong>{selectedAnalysisForLog.ticket_id?.ticket_id}</strong></p>
                            </div>
                            <button onClick={() => setShowViewLog(false)} style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            {loadingLogs ? (
                                <div style={{ padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: "8px" }}>
                                    <div style={styles.spinnerSmall}></div>
                                    <p style={{ color: "#64748b", fontSize: "14px", marginTop: "16px" }}>Loading work logs...</p>
                                </div>
                            ) : workLogs.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: "8px" }}>
                                    <p style={{ color: "#64748b", fontSize: "14px" }}>No work logs submitted yet</p>
                                </div>
                            ) : (
                                (() => {
                                    // Filter logs for the current logged-in user (case-insensitive, trimmed comparison)
                                    const currentUserName = (user?.name || "").toLowerCase().trim();
                                    const filteredLogs = workLogs.filter(l => 
                                        (l.worker_name || "").toLowerCase().trim() === currentUserName ||
                                        String(l.worker_id || "") === String(user?.id || "")
                                    );

                                    // Aggregate per-day totals and calculate overall seconds
                                    const dayTotals = {};
                                    let overallSeconds = 0;
                                    const durationRegex = /(\d+)h\s*(\d+)m\s*(\d+)s/i;
                                    
                                    filteredLogs.forEach(log => {
                                        const durationStr = String(log.duration || "").trim();
                                        const parts = durationStr.match(durationRegex);
                                        let secs = 0;
                                        if (parts && parts.length >= 4) {
                                            const h = parseInt(parts[1]) || 0;
                                            const m = parseInt(parts[2]) || 0;
                                            const s = parseInt(parts[3]) || 0;
                                            secs = h * 3600 + m * 60 + s;
                                        }
                                        const dateKey = new Date(log.log_date).toLocaleDateString();
                                        dayTotals[dateKey] = (dayTotals[dateKey] || 0) + secs;
                                        overallSeconds += secs;
                                    });

                                    const formatSecs = (secs) => {
                                        const h = Math.floor(secs / 3600);
                                        const m = Math.floor((secs % 3600) / 60);
                                        const s = secs % 60;
                                        return `${h}h ${m}m ${s}s`;
                                    };

                                    return (
                                        <div>
                                            {/* Header: User name and overall total */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}>
                                                <div>
                                                    <div style={{ fontSize: "12px", color: "#0f172a", fontWeight: 700, textTransform: "uppercase" }}>Showing records for:</div>
                                                    <div style={{ fontSize: "15px", color: "#0f172a", fontWeight: 800 }}>{user?.name || "You"}</div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: "12px", color: "#0f172a", fontWeight: 700, textTransform: "uppercase" }}>Total Time</div>
                                                    <div style={{ fontSize: "16px", color: "#10b981", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{formatSecs(overallSeconds)}</div>
                                                </div>
                                            </div>

                                            {/* Per-day breakdown */}
                                            {Object.keys(dayTotals).length > 0 && (
                                                <div style={{ marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                                                    <div style={{ fontSize: "12px", color: "#475569", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase" }}>📅 Per-Day Breakdown</div>
                                                    {Object.entries(dayTotals).map(([date, secs]) => (
                                                        <div key={date} style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", marginBottom: "4px", background: "white", borderRadius: "4px", fontSize: "13px" }}>
                                                            <div style={{ color: "#0f172a", fontWeight: 600 }}>{date}</div>
                                                            <div style={{ color: "#10b981", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{formatSecs(secs)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Work logs table */}
                                            <div style={{ overflowX: "auto" }}>
                                                <table style={styles.logTable}>
                                                    <thead>
                                                        <tr>
                                                            <th style={styles.logTh}>Time Range</th>
                                                            <th style={styles.logTh}>Duration</th>
                                                            <th style={styles.logTh}>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredLogs.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                                                                    No work logs for you on this ticket
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            filteredLogs.map((log, idx) => (
                                                                <tr key={idx} style={idx % 2 === 0 ? styles.logTrEven : styles.logTrOdd}>
                                                                    <td style={styles.logTd}>
                                                                        <div style={{ fontSize: "13px", color: "#0f172a" }}>{log.from_time} - {log.to_time}</div>
                                                                    </td>
                                                                    <td style={styles.logTd}>
                                                                        <span style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" }}>
                                                                            {log.duration}
                                                                        </span>
                                                                    </td>
                                                                    <td style={styles.logTd}>
                                                                        <div style={{ fontSize: "13px", color: "#0f172a" }}>{new Date(log.log_date).toLocaleDateString()}</div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </div>
                </div>
            )}
         
            {/* --- Analysis Cards --- */}
            <div style={styles.cardContainer}>
                {filteredAnalyses.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📊</div>
                        <h3 style={styles.emptyTitle}>No Material Approved Tickets</h3>
                       
                    </div>
                ) : (
                    <div style={styles.cardGrid}>
                        {filteredAnalyses.map((analysis) => {
                            const statusName = analysis.ticket_id?.status_id?.name || analysis.ticket_id?.status;
                            const statusStyles = getStatusStyle(statusName);
                            const timerData = timers[analysis._id];
                            const hasRunningTimer = timerData?.isRunning;
                            const hasStoppedTimer = timerData && !timerData.isRunning && timerData.startTime && timerData.endTime;
                            
                            return (
                                <div key={analysis._id} style={styles.cardItem} className={hasRunningTimer ? "card-timer-active" : hasStoppedTimer ? "card-timer-stopped" : ""}>
                                    <div style={styles.cardHeader}>
                                        <div style={styles.cardIdRow}>
                                          
                                                                                    {/* Title and Location - Professional Design */}
                                        <button
  className="location-link"
  onClick={() => openMap(analysis.ticket_id?.location || analysis.location || analysis.ticket_location || analysis.ticket_id?.title)}
  style={{
    marginTop: "14px",
    background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)",
    border: "1px solid #d1fae5",
    padding: "16px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "left",
    width: hasRunningTimer ? "40%" : "70%",
    boxShadow: "0 1px 3px rgba(16, 185, 129, 0.08)"
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)";
    e.currentTarget.style.transform = "translateY(-2px)";
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)";
    e.currentTarget.style.boxShadow = "0 1px 3px rgba(16, 185, 129, 0.08)";
    e.currentTarget.style.transform = "translateY(0)";
  }}
  title="Click to view in maps"
>
  {/* Title Row */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", paddingBottom: "14px", borderBottom: "1.5px solid #bbf7d0" }}>
    <span style={{ 
      fontSize: "12px", 
      fontWeight: "700", 
      color: "#10b981", 
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}>
      <span>🗺️</span>
      Title
    </span>
    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", maxWidth: "65%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "right" }} title={analysis.ticket_id?.title}>
      {analysis.ticket_id?.title || "-"}
    </span>
  </div>

  {/* Location Row */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ 
      fontSize: "12px", 
      fontWeight: "700", 
      color: "#10b981", 
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      paddingRight:"2px"
    }}>
      <span>📍</span>
      Location:
    </span>
    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", maxWidth: "65%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "right" }} title={analysis.ticket_id?.location || analysis.location || analysis.ticket_location}>
      {analysis.ticket_id?.location || analysis.location || analysis.ticket_location || "-"}
    </span>
  </div>
</button>
                                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexDirection: "column" }}>
                                                {hasRunningTimer && (
                                                    <div style={{ 
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        padding: "8px 12px", 
                                                        background: "#dcfce7", 
                                                        color: "#166534",
                                                        borderRadius: "6px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        animation: "badgeTimerRunning 1.5s infinite",
                                                        border: "1px solid #10b981"
                                                    }}>
                                                        <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                                                            <span>⏱️</span>
                                                            RUNNING
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: "13px", 
                                                            fontWeight: "700",
                                                            fontFamily: "'JetBrains Mono', monospace",
                                                            color: "#065f46"
                                                        }}>
                                                            {currentTime.toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                )}
                                            
                                            </div>
                                        </div>
                                        
                                        {/* Timer Display on Right Side - Static Duration Only */}
                                        {hasStoppedTimer && (
                                            <div style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "12px 16px",
                                                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                                borderRadius: "8px",
                                                border: "2px solid #3b82f6",
                                                boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)"
                                            }}>
                                                <div style={{
                                                    fontSize: "20px",
                                                    fontWeight: "800",
                                                    color: "#1e40af",
                                                    fontFamily: "'JetBrains Mono', monospace"
                                                }}>
                                                    {timerData.duration || "0h 0m"}
                                                </div>
                                                <div style={{
                                                    fontSize: "11px",
                                                    fontWeight: "700",
                                                    color: "#1e3a8a",
                                                    marginTop: "4px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    ⏱️ DURATION
                                                </div>
                                            </div>
                                        )}
                                        



                                    </div>
                                    <div style={styles.cardBody}>
                                        <div style={styles.cardInfoGrid}>
                                            <div style={styles.infoCol}>
                                                <span style={styles.label}>Ticket ID</span>
                                                <span style={styles.value}>{analysis.ticket_id?.ticket_id || "-"}</span>
                                            </div>
                                            <div style={styles.infoCol}>
                                                <span style={styles.label}>Worker</span>
                                                <span style={styles.value}>{user?.name || analysis.worker_name || "-"}</span>
                                            </div>
                                        </div>
                                        <div style={{ ...styles.cardInfoGrid, marginTop: "12px" }}>
                                            <div style={styles.infoCol}>
                                                <span style={styles.label}>Status</span>
                                                <span style={{ ...styles.statusBadge, ...statusStyles }}>
                                                    {statusName || "Unknown"}
                                                </span>
                                            </div>
                                            <div style={styles.infoCol}>
                                                <span style={styles.label}>Date</span>
                                                <span style={styles.value}>
                                                    {new Date(analysis.created_at || analysis.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {analysis.material_description && (
                                            <div style={{ marginTop: "12px" }}>
                                                <span style={styles.label}>Description</span>
                                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                    {analysis.material_description}
                                                </p>
                                            </div>
                                        )}
                                        {analysis.uploaded_images && analysis.uploaded_images.length > 0 && (
                                            <div style={{ marginTop: "12px" }}>
                                                <span style={styles.label}>Images ({analysis.uploaded_images.length})</span>
                                            </div>
                                        )}
                                        
                                        {/* Total Logged Time for this Ticket - ALL USERS */}
                                        <div style={{
                                            marginTop: "16px",
                                            padding: "12px 14px",
                                            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                            borderRadius: "8px",
                                            border: "1px solid #3b82f6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        }}>
                                            <div>
                                                <div style={{ fontSize: "11px", fontWeight: "700", color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                    ⏱️ Total Time (You)
                                                </div>
                                                <div style={{ fontSize: "16px", fontWeight: "800", color: "#1e3a8a", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                                                    {calculateTicketTotalTime(analysis._id)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.cardFooter}>
                                        <button onClick={() => handleViewAnalysisDetails(analysis)} style={styles.btnOutline}>
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSelectedAnalysisForLog({ ...analysis, worker_name: user?.name || analysis.worker_name });
                                                setWorkLogs([]);
                                                setShowWorkLogForm(true);
                                            }} 
                                            style={styles.btnAction}>
                                            <ClockIcon />
                                            <span>Work Log</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSelectedAnalysisForLog(analysis);
                                                loadWorkLogs(analysis._id);
                                                setShowViewLog(true);
                                            }} 
                                            style={styles.btnOutline}>
                                            <ListIcon />
                                            <span>View Log</span>
                                        </button>
                                        <button 
                                            onClick={() => handleCompleteWork(analysis)} 
                                            style={styles.btnSuccess}>
                                            <CheckCircleIcon />
                                            <span>Mark as Complete</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- Complete Work Modal --- */}
            {showCompleteWorkModal && selectedAnalysisForCompletion && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalMedium} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h3 style={styles.modalTitle}>Complete Work</h3>
                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                                    Ticket: <strong>{selectedAnalysisForCompletion.ticket_id?.ticket_id}</strong>
                                </p>
                            </div>
                            <button onClick={() => setShowCompleteWorkModal(false)} style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
                                {/* Worker Name Display */}
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={styles.inputLabel}>Worker Name</label>
                                    <div style={{ 
                                        fontSize: "15px", 
                                        fontWeight: "600", 
                                        color: "#0f172a", 
                                        marginTop: "4px",
                                        padding: "12px",
                                        background: "white",
                                        borderRadius: "6px",
                                        border: "1px solid #e2e8f0"
                                    }}>
                                        {user?.name || selectedAnalysisForCompletion.worker_name || "Unknown"}
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label style={styles.inputLabel}>Upload Completion Images (Optional)</label>
                                    
                                    {/* Single Camera Button with Menu */}
                                    <div style={{ position: "relative", marginBottom: "16px" }}>
                                        <div style={{
                                            padding: "16px",
                                            border: "2px dashed #cbd5e1",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            background: "white",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }} onClick={handleOpenCamera}>
                                            <div style={{ cursor: "pointer", pointerEvents: "none" }}>
                                                <p style={{ margin: "0 0 6px 0", fontSize: "24px" }}>📷</p>
                                                <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                                                    Take Photo / Choose Device
                                                </p>
                                                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                                                    Click to select camera or gallery
                                                </p>
                                            </div>
                                        </div>

                                        {/* Camera Menu Dropdown */}
                                        {showCameraMenu && (
                                            <div style={{
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                right: 0,
                                                marginTop: "8px",
                                                background: "white",
                                                borderRadius: "8px",
                                                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                                border: "1px solid #e2e8f0",
                                                zIndex: 1000,
                                                overflow: "hidden"
                                            }}>
                                                {/* Gallery Option */}
                                                <button 
                                                    onClick={handleOpenGallery}
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px 16px",
                                                        border: "none",
                                                        background: "transparent",
                                                        textAlign: "left",
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid #e2e8f0",
                                                        transition: "all 0.2s",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "12px",
                                                        fontSize: "14px",
                                                        color: "#1e293b"
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                                                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                                                >
                                                    <span style={{ fontSize: "18px" }}>🗂️</span>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: "600" }}>Gallery</p>
                                                        <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Multiple files</p>
                                                    </div>
                                                </button>

                                                {/* Rear Camera Option */}
                                                <button 
                                                    onClick={handleOpenRearCamera}
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px 16px",
                                                        border: "none",
                                                        background: "transparent",
                                                        textAlign: "left",
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid #e2e8f0",
                                                        transition: "all 0.2s",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "12px",
                                                        fontSize: "14px",
                                                        color: "#1e293b"
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                                                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                                                >
                                                    <span style={{ fontSize: "18px" }}>📷</span>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: "600" }}>Rear Camera</p>
                                                        <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Back camera (Mobile)</p>
                                                    </div>
                                                </button>

                                                {/* Front Camera Option */}
                                                <button 
                                                    onClick={handleOpenFrontCamera}
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px 16px",
                                                        border: "none",
                                                        background: "transparent",
                                                        textAlign: "left",
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid #e2e8f0",
                                                        transition: "all 0.2s",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "12px",
                                                        fontSize: "14px",
                                                        color: "#1e293b"
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                                                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                                                >
                                                    <span style={{ fontSize: "18px" }}>🤳</span>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: "600" }}>Front Camera</p>
                                                        <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Selfie camera (Mobile)</p>
                                                    </div>
                                                </button>

                                                {/* Desktop Webcam Option */}
                                                <button 
                                                    onClick={handleOpenDesktopWebcam}
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px 16px",
                                                        border: "none",
                                                        background: "transparent",
                                                        textAlign: "left",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "12px",
                                                        fontSize: "14px",
                                                        color: "#1e293b"
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                                                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                                                >
                                                    <span style={{ fontSize: "18px" }}>💻</span>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: "600" }}>Desktop Webcam</p>
                                                        <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Computer camera</p>
                                                    </div>
                                                </button>
                                            </div>
                                        )}

                                        {/* Hidden Input Elements */}
                                        <input 
                                            type="file" 
                                            multiple
                                            accept="image/*"
                                            onChange={handleCompleteWorkImageChange}
                                            style={{ display: "none" }}
                                            id="cameraInputGallery"
                                        />
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleCompleteWorkImageChange}
                                            style={{ display: "none" }}
                                            id="cameraInputRear"
                                        />
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            capture="user"
                                            onChange={handleCompleteWorkImageChange}
                                            style={{ display: "none" }}
                                            id="cameraInputFront"
                                        />
                                    </div>

                                    {/* Close menu when clicking outside */}
                                    {showCameraMenu && (
                                        <div 
                                            style={{
                                                position: "fixed",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                zIndex: 999
                                            }}
                                            onClick={() => setShowCameraMenu(false)}
                                        />
                                    )}

                                    {/* Image Previews */}
                                    {completeWorkImagePreviews.length > 0 && (
                                        <div style={{ marginTop: "16px" }}>
                                            <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>
                                                Selected Images ({completeWorkImagePreviews.length})
                                            </p>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px" }}>
                                                {completeWorkImagePreviews.map((preview, idx) => (
                                                    <div key={idx} style={{ position: "relative" }}>
                                                        <img 
                                                            src={preview} 
                                                            alt={`preview-${idx}`}
                                                            style={{ 
                                                                width: "100%", 
                                                                height: "100px", 
                                                                objectFit: "cover", 
                                                                borderRadius: "6px",
                                                                border: "1px solid #e2e8f0"
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit and Cancel Buttons */}
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                <button 
                                    onClick={() => handleSubmitCompleteWork()}
                                    style={{
                                        ...styles.btnPrimary,
                                        background: "#10b981",
                                    }}>
                                    Mark as Complete
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowCompleteWorkModal(false);
                                        setCompleteWorkImages([]);
                                        setCompleteWorkImagePreviews([]);
                                    }}
                                    style={styles.btnSecondary}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Desktop Webcam Modal --- */}
            {showWebcamModal && (
                <div style={styles.modalOverlay} onClick={stopWebcam}>
                    <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Desktop Webcam</h3>
                            <button onClick={stopWebcam} style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={{ background: "#000", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                                <video 
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    style={{ width: "100%", display: "block" }}
                                />
                            </div>
                            <canvas 
                                ref={canvasRef}
                                style={{ display: "none" }}
                            />
                            
                            <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #bbf7d0" }}>
                                <p style={{ margin: 0, fontSize: "14px", color: "#166534" }}>
                                    📸 Position yourself in frame and click "Capture Photo"
                                </p>
                            </div>

                            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "20px" }}>
                                <button 
                                    onClick={captureWebcamPhoto}
                                    style={{
                                        padding: "12px 24px",
                                        background: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "#059669"}
                                    onMouseLeave={(e) => e.target.style.background = "#10b981"}
                                >
                                    📸 Capture Photo
                                </button>
                                <button 
                                    onClick={stopWebcam}
                                    style={{
                                        padding: "12px 24px",
                                        background: "#ef4444",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "#dc2626"}
                                    onMouseLeave={(e) => e.target.style.background = "#ef4444"}
                                >
                                    🛑 Close Camera
                                </button>
                            </div>

                            {/* Captured Photos Preview */}
                            {completeWorkImagePreviews.length > 0 && (
                                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                    <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                                        ✅ Captured Photos ({completeWorkImagePreviews.length})
                                    </h4>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
                                        {completeWorkImagePreviews.map((preview, idx) => (
                                            <div key={idx} style={{ position: "relative" }}>
                                                <img 
                                                    src={preview} 
                                                    alt={`capture-${idx}`}
                                                    style={{ 
                                                        width: "100%", 
                                                        height: "120px", 
                                                        objectFit: "cover", 
                                                        borderRadius: "8px",
                                                        border: "2px solid #10b981",
                                                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)"
                                                    }}
                                                />
                                                <div style={{
                                                    position: "absolute",
                                                    top: "4px",
                                                    right: "4px",
                                                    background: "#10b981",
                                                    color: "white",
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "12px",
                                                    fontWeight: "700"
                                                }}>
                                                    ✓
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
   );
}

// --- CSS Animations ---
const timerAnimationStyles = `
  @keyframes timerPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }

  @keyframes timerGlow {
    0% {
      background: #dcfce7;
    }
    50% {
      background: #c1fae8;
    }
    100% {
      background: #dcfce7;
    }
  }

  @keyframes cardTimerRunning {
    0% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }

  @keyframes cardTimerStopped {
    0%, 100% {
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }
    50% {
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
    }
  }

  @keyframes badgeTimerRunning {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .timer-running-pulse {
    animation: timerPulse 2s infinite;
  }

  .timer-running-glow {
    animation: timerGlow 2s infinite;
  }

  .card-timer-active {
    animation: cardTimerRunning 2.5s infinite;
  }

  .card-timer-stopped {
    animation: cardTimerStopped 1.5s infinite;
  }

  .badge-timer-active {
    animation: badgeTimerRunning 1.5s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = timerAnimationStyles;
    document.head.appendChild(style);
}

// --- Styles ---
const styles = {
    pageContainer: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        padding: "32px",
        color: "#1e293b",
     
    },
    headerSection: {
     display: "flex",
        alignItems: "center",
    flexWrap: "wrap",
        gap: "16px",
    justifyContent: "flex-start",
    marginBottom: "24px",
    },
    pageTitle: {
        margin: "0 0 4px 0",
        fontSize: "32px",
        fontWeight: "800",
        color: "#0f172a",
        letterSpacing: "-0.5px",
    },
    pageSubtitle: {
        margin: "0",
        fontSize: "15px",
        color: "#64748b",
        fontWeight: "400",
    },
    statsBadge: {
        background: "white",
        padding: "8px 16px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    statsCount: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#3b82f6",
    },
    statsLabel: {
        fontSize: "13px",
        color: "#94a3b8",
        textTransform: "uppercase",
        fontWeight: "600",
    },

    searchInputWrapper: {
        position: "relative",
        maxWidth: "600px",
    },
    searchIcon: {
        position: "absolute",
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
    },
    searchInput: {
        width: "100%",
        padding: "14px 14px 14px 48px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        outline: "none",
        fontSize: "15px",
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s",
        color: "#334155",
    },

    // Grid
    cardContainer: {
        background: "transparent",
    },
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: "24px",
    },

    // Card
    cardItem: {
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        borderLeft: "4px solid transparent", // Dynamic color inline
    },
    "cardItem:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
    cardHeader: {
        padding: "16px 20px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardIdRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    cardIdBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#f8fafc",
        padding: "6px 10px",
        borderRadius: "6px",
    },
    cardId: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "13px",
        fontWeight: "600",
        color: "#64748b",
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: "10px",
        fontWeight: "700",
        padding: "4px 10px",
        borderRadius: "9999px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },

    // Card Body
    cardBody: {
        padding: "20px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    cardInfoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
    },
    infoCol: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    label: {
        fontSize: "11px",
        fontWeight: "700",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    value: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#334155",
    },
    statusBadge: {
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700",
        textTransform: "uppercase",
    },

    // Card Footer
    cardFooter: {
        padding: "16px 20px",
        borderTop: "1px solid #f1f5f9",
        background: "#f8fafc",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
    },
    
    // Buttons
    btnOutline: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1px solid #cbd5e1",
        background: "white",
        color: "#475569",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        transition: "all 0.2s",
    },
    "btnOutline:hover": {
        background: "#f1f5f9",
        borderColor: "#94a3b8",
    },
    btnAction: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1px solid #3b82f6",
        background: "white",
        color: "#2563eb",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        transition: "all 0.2s",
    },
    "btnAction:hover": {
        background: "#eff6ff",
        borderColor: "#2563eb",
    },
    btnSuccess: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1px solid #10b981",
        background: "white",
        color: "#059669",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        transition: "all 0.2s",
        gridColumn: "2", // Make complete button wide
    },
    "btnSuccess:hover": {
        background: "#ecfdf5",
        borderColor: "#059669",
    },

    // Empty State
    emptyState: {
        textAlign: "center",
        padding: "60px 40px",
        background: "white",
        borderRadius: "16px",
        border: "1px dashed #cbd5e1",
    },
    emptyIcon: {
        fontSize: "48px",
        marginBottom: "16px",
        opacity: "0.8",
    },
    emptyTitle: {
        margin: "0 0 8px 0",
        fontSize: "20px",
        fontWeight: "700",
        color: "#0f172a",
    },
    emptyText: {
        margin: 0,
        fontSize: "15px",
        color: "#64748b",
    },

    // Loading
    spinnerContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    spinnerSmall: {
        width: "30px",
        height: "30px",
        border: "3px solid #e2e8f0",
        borderTop: "3px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto",
    },
    loadingText: {
        marginTop: "16px",
        color: "#64748b",
        fontSize: "16px",
        fontWeight: "500",
    },

    // Modals
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease-out",
    },
    modalLarge: {
        background: "white",
        width: "700px",
        maxWidth: "90%",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        maxHeight: "90vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    modalMedium: {
        background: "white",
        width: "550px",
        maxWidth: "90%",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        maxHeight: "90vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    modalHeader: {
        padding: "20px 24px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "700",
        color: "#0f172a",
    },
    modalBody: {
        padding: "24px",
        overflowY: "auto",
    },
    iconBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#94a3b8",
        padding: "4px",
        borderRadius: "4px",
        transition: "color 0.2s",
    },
    "iconBtn:hover": {
        color: "#475569",
        background: "#f1f5f9",
    },
    iconCircle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        background: "#eff6ff",
        color: "#2563eb",
    },

    // Detail Modal Specifics
    detailLabel: {
        margin: "0 0 6px 0",
        fontSize: "12px",
        color: "#94a3b8",
        textTransform: "uppercase",
        fontWeight: "700",
        letterSpacing: "0.05em",
    },
    detailValue: {
        margin: 0,
        fontSize: "15px",
        color: "#0f172a",
        fontWeight: "500",
    },

    // Work Log Form Inputs
    inputLabel: {
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        color: "#475569",
        marginBottom: "6px",
    },
    timeInput: {
        width: "100%",
        padding: "10px",
        marginTop: "4px",
        border: "1px solid #cbd5e1",
        borderRadius: "6px",
        fontSize: "15px",
        outline: "none",
        transition: "border 0.2s",
    },
    "timeInput:focus": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
    },
    btnPrimary: {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        background: "#3b82f6",
        color: "white",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "all 0.2s",
    },
    "btnPrimary:hover": {
        background: "#2563eb",
        transform: "translateY(-1px)",
    },
    btnSecondary: {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        background: "white",
        color: "#475569",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "all 0.2s",
    },
    "btnSecondary:hover": {
        background: "#f8fafc",
        borderColor: "#94a3b8",
    },

    // Log Table Styles
    logTable: {
        marginTop: "16px",
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
    },
    logTh: {
        textAlign: "left",
        padding: "12px 16px",
        background: "#f8fafc",
        color: "#64748b",
        fontWeight: "700",
        textTransform: "uppercase",
        fontSize: "12px",
        borderBottom: "2px solid #e2e8f0",
    },
    logTrEven: {
        background: "#ffffff",
    },
    logTrOdd: {
        background: "#f8fafc",
    },
    logTd: {
        padding: "16px",
        borderBottom: "1px solid #e2e8f0",
        color: "#334155",
    },

    // Toast
    toast: {
        position: "fixed",
        top: "24px",
        right: "24px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        zIndex: 2000,
        animation: "slideIn 0.3s ease-out",
        minWidth: "320px",
    },
    toastSuccess: {
        borderLeft: "4px solid #10b981",
    },
    toastError: {
        borderLeft: "4px solid #ef4444",
    },
    toastContent: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        color: "#0f172a",
    },
    toastMessage: {
        fontSize: "14px",
        fontWeight: "500",
    },
    toastClose: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#94a3b8",
        padding: 0,
        display: "flex",
        alignItems: "center",
    },
    errorIcon: {
        color: "#ef4444",
        fontSize: "18px",
    },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin { 
    0% { transform: rotate(0deg); } 
    100% { transform: rotate(360deg); } 
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
`;
document.head.appendChild(styleSheet);

export default MaterialApprovedPage;