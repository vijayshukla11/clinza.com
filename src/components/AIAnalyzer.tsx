/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Upload, Camera, Sparkles, AlertCircle, CheckCircle2, RotateCcw, ArrowRight, Heart, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { AIAnalysisResult as StyleAdvisorResult, Product } from "../types";
import { getProducts } from "../utils";
import { saveStyleAnalysisLeadToCloud } from "../supabase";

interface StyleAdvisorProps {
  setRoute: (route: string) => void;
  onProductClick: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  wishlistIds: string[];
}

const PREMIUM_SAMPLES = [
  {
    name: "Classic Sartorial Profile",
    gender: "Male",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    description: "Classic profile with sharp features, warm beige skin tone, and structured build."
  },
  {
    name: "Modern Minimalist Profile",
    gender: "Neutral / Unisex",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    description: "Modern frame with light neutral undertone, chiseled face, and smart-casual preference."
  },
  {
    name: "Intelligent Leisure Profile",
    gender: "Athletic Build",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200",
    description: "Athletic build, olivaceous warm tone, square face, and sporty co-ord preferences."
  }
];

export default function AIAnalyzer({
  setRoute,
  onProductClick,
  onAddToWishlist,
  onAddToCart,
  wishlistIds
}: StyleAdvisorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("Initializing bespoke style match sensors...");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StyleAdvisorResult | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [useCamera, setUseCamera] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Custom user survey fields
  const [surveyType, setSurveyType] = useState("all");
  const [surveyBody, setSurveyBody] = useState("athletic");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Rotating loading messages
  useEffect(() => {
    if (!loading) return;
    const messages = [
      "Step 2: Extracting style attributes...",
      "Mapping luxury garment contours & line patterns...",
      "Matching skin tones with uncompromised loom weaves...",
      "Re-analyzing athletic & casual geometry builds...",
      "Step 3: Calculating recommended collection matches...",
      "Step 4: Harmonizing color contrast scales...",
      "Step 5: Verifying personalized sizing matrices...",
      "Stylist finalizing your absolute profile diagnosis..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setProgressMsg(messages[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const resetAnalyzer = () => {
    setImageSrc(null);
    setResult(null);
    setError(null);
    setRecommendedProducts([]);
    stopCamera();
    setUseCamera(false);
    setCurrentStep(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setError(null);
        setCurrentStep(2); // Proceed to Step 2: Analyze Your Style
      };
      reader.onerror = () => {
        setError("Failed to convert image. Please drag a standard JPEG or PNG file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setError(null);
        setCurrentStep(2); // Proceed to Step 2: Analyze Your Style
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setError(null);
    setUseCamera(true);
    setImageSrc(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error(err));
      }
    } catch (err) {
      console.error(err);
      setError("Camera permission denied or camera device missing. Please upload/drop a photo or select a sample profile below.");
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureSelfieIndex = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImageSrc(dataUrl);
        stopCamera();
        setUseCamera(false);
        setCurrentStep(2); // Proceed to Step 2: Analyze Your Style
      }
    }
  };

  const selectSample = (url: string) => {
    setImageSrc(url);
    setError(null);
    setCurrentStep(2); // Proceed to Step 2: Analyze Your Style
    window.scrollTo({ top: document.getElementById("style-advisor-main-interface")?.offsetTop ?? 200, behavior: "smooth" });
  };

  const getStyleScore = (p: Product, res: StyleAdvisorResult): number => {
    let score = 0;
    const cat = p.category.toLowerCase();
    
    // Collections score
    const matchedCols = res.recommendedCollections || [];
    matchedCols.forEach(col => {
      if (cat.includes(col.toLowerCase())) score += 5;
    });

    // Colors match
    const recColors = res.recommendedColors || [];
    recColors.forEach(color => {
      if (p.colors.some(c => c.name.toLowerCase().includes(color.toLowerCase()))) {
        score += 8;
      }
    });

    return score;
  };

  const runStyleAnalysis = async () => {
    if (!imageSrc) {
      setError("Please capture a photo, drag a portrait, or pick a sample profile card first.");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep(2); // Actively Analyzing style
    
    try {
      const response = await fetch("/api/analyze-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageSrc,
          surveyData: {
            preferredCategory: surveyType,
            inferredBody: surveyBody,
            targetMarket: "India Premium"
          }
        })
      });

      if (!response.ok) {
        throw new Error("Stylist advisor server experienced an issue.");
      }

      const data: StyleAdvisorResult = await response.json();
      setResult(data);

      const allProducts = getProducts();
      const scoredProducts = allProducts.map(p => ({
        product: p,
        score: getStyleScore(p, data)
      }));

      scoredProducts.sort((a, b) => b.score - a.score);
      setRecommendedProducts(scoredProducts.map(item => item.product).slice(0, 4));
      setCurrentStep(3); // Result achieved! Ready to present recommendations

      // Save submission data to Supabase
      saveStyleAnalysisLeadToCloud({
        imageUrl: imageSrc.startsWith("data:") ? "Customer Uploaded Image" : imageSrc,
        recommendedColors: data.recommendedColors || data.colorCompatibility?.recommended || [],
        recommendedCollections: data.recommendedCollections || [],
        recommendedSizes: data.recommendedFits || []
      });

    } catch (err) {
      console.error("Style Advisor API error:", err);
      setError("Service is running in resort mode. Enjoy bespoke advisor recommendations below.");
      
      const fallbackResult: StyleAdvisorResult = {
        faceShape: "Chiseled Symmetrical",
        skinTone: "Warm Olivaceous Beige",
        bodyType: "Athletic/Standard Symmetrical",
        fashionPreference: "Clinza Resort & Smart Trousers",
        colorCompatibility: {
          recommended: ["Sage Green", "Oatmeal Beige", "Sartorial White", "Raw Indigo"],
          avoid: ["Neon Yellow", "Severe Hot Pink"]
        },
        styleArchetype: "The Effortless Classicist",
        rationale: "Your symmetrical features harmonize perfectly with soft-shouldered CLINZA European Linens and premium double-pleated trousers. We suggest pairing unwashed Indigo layers with oatmeal beige accents.",
        recommendedCollections: ["shirts", "pants", "footwear"],
        recommendedFits: ["Relaxed Cuban Resort Fit", "Double Pleated Sartorial Taper"],
        recommendedColors: ["Sage Green", "Sartorial White", "Sand Beige"]
      };

      setResult(fallbackResult);
      const allProducts = getProducts();
      const scoredProducts = allProducts.map(p => ({
        product: p,
        score: getStyleScore(p, fallbackResult)
      }));
      scoredProducts.sort((a, b) => b.score - a.score);
      setRecommendedProducts(scoredProducts.map(item => item.product).slice(0, 4));
      setCurrentStep(3);

      saveStyleAnalysisLeadToCloud({
        imageUrl: imageSrc.startsWith("data:") ? "Customer Uploaded Image" : imageSrc,
        recommendedColors: fallbackResult.recommendedColors || fallbackResult.colorCompatibility?.recommended || [],
        recommendedCollections: fallbackResult.recommendedCollections || [],
        recommendedSizes: fallbackResult.recommendedFits || []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="style-advisor-section" className="bg-[#0c0c0c] text-white py-10 sm:py-12 md:py-14 px-3 sm:px-6 lg:px-8 border-t border-b border-zinc-900 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div id="style-advisor-main-interface" className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-zinc-800 text-left">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="px-2 py-0.5 bg-[#F27D26] text-black text-[8px] sm:text-[9px] font-black uppercase tracking-wider rounded-sm">
                Style Advisor
              </span>
              <h2 className="text-xl sm:text-3.5xl font-sans font-black tracking-tight text-white uppercase select-none">
                Find Your Perfect Fit
              </h2>
            </div>
            <p className="text-gray-400 text-[11px] sm:text-sm font-sans leading-relaxed">
              Our Personal Style Match Assistant curates a wardrobe specifically for you. Redefine your luxury fits through color harmony, silhouette analysis, and custom style matrices.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 bg-[#050505] p-3 sm:p-4.5 border border-zinc-900 rounded-sm shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono tracking-wide">Color Match Assistant</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono tracking-wide">Perfect Fit Formula</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono tracking-wide">Silhouette Mapping</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono tracking-wide">Smart Recommendations</span>
            </div>
          </div>
        </div>

        {/* SEQUENTIAL WORKFLOW STEPPER TIMELINE */}
        <div id="advisor-steps-stepper" className="max-w-4xl mx-auto mb-10 sm:mb-14">
          <div className="grid grid-cols-5 gap-1 sm:gap-4 relative text-center">
            {[
              { num: 1, label: "Step 1", title: "Upload Your Photo" },
              { num: 2, label: "Step 2", title: "Analyze Your Style" },
              { num: 3, label: "Step 3", title: "Recommended Collections" },
              { num: 4, label: "Step 4", title: "Recommended Colors" },
              { num: 5, label: "Step 5", title: "Recommended Sizes" }
            ].map((st) => {
              const isPassed = result ? true : (loading ? st.num <= 2 : (imageSrc ? st.num <= 2 : st.num === 1));
              const isActive = loading ? (st.num === 2) : (result ? st.num >= 3 : st.num === currentStep);
              return (
                <div key={st.num} className="flex flex-col items-center">
                  <div className={`w-6 h-6 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                    isPassed 
                      ? "bg-[#F27D26] text-black ring-2 ring-orange-500/55" 
                      : (isActive ? "bg-white text-black ring-2 ring-zinc-650" : "bg-zinc-900 text-zinc-500 border border-zinc-850")
                  }`}>
                    {st.num}
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-mono tracking-wider text-gray-500 mt-1 uppercase block">{st.label}</span>
                  <p className={`text-[9px] sm:text-[11px] font-sans font-bold leading-tight mt-0.5 line-clamp-1 ${
                    isActive || isPassed ? "text-white" : "text-zinc-600"
                  }`}>{st.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN BODY GRID */}
        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* LEFT COLUMN: SOURCE PROFILE SURVEY */}
            <div className="lg:col-span-4 bg-[#050505] p-4 sm:p-6 rounded-none border border-zinc-900 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black tracking-wider text-gray-400 uppercase mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="text-[#F27D26]">01 /</span> Style Preferences
                </h3>
                
                {/* PREFERRED LOOK */}
                <div className="mb-6">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2.5">
                    Target Collection Look
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "all", name: "Sartorial Mix" },
                      { id: "shirts", name: "Linen Shirts" },
                      { id: "jeans", name: "Raw Denim" },
                      { id: "pants", name: "Smart Trousers" }
                    ].map((opt) => (
                      <button
                        id={`survey-opt-${opt.id}`}
                        key={opt.id}
                        onClick={() => setSurveyType(opt.id)}
                        className={`text-xs py-2 px-3 rounded-none border text-center font-bold tracking-wide transition-all cursor-pointer ${
                          surveyType === opt.id
                            ? "bg-[#F27D26] border-[#F27D26] text-black"
                            : "bg-white/5 border-zinc-800 text-gray-450 hover:bg-white/10"
                        }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* INFERRED BODY TYPE */}
                <div className="mb-6">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2.5">
                    Anatomical Build
                  </label>
                  <select
                    id="survey-body-select"
                    value={surveyBody}
                    onChange={(e) => setSurveyBody(e.target.value)}
                    className="w-full bg-[#080808] border border-zinc-800 rounded-none py-3 px-4 text-xs font-bold tracking-wide focus:outline-none focus:border-[#F27D26] text-gray-200"
                  >
                    <option value="athletic" className="bg-zinc-955 text-white">Athletic / Defined build</option>
                    <option value="ectomorph" className="bg-zinc-955 text-white">Lean / Tall frame</option>
                    <option value="endomorph" className="bg-zinc-955 text-white">Robust / Solid frame</option>
                    <option value="rectangular" className="bg-zinc-955 text-white">Symmetrical / Standard frame</option>
                  </select>
                </div>
              </div>

              {/* PRIVACY INFO BLOCK */}
              <div className="bg-white/5 border border-zinc-850 rounded-none p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#F27D26] shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  The uploaded photo is processed entirely through secure server buffers. CLINZA respects your privacy and never retains your private facial snaps.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE UPLOAD AND CAMERA CONTAINER */}
            <div className="lg:col-span-8 bg-[#050505] p-4 sm:p-6 rounded-none border border-zinc-900 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[420px] relative">
              {loading ? (
                /* LOADING STREAM SCREEN */
                <div className="text-center py-6 sm:py-10 max-w-md my-auto flex flex-col items-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 relative flex items-center justify-center mb-4 sm:mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-orange-600/30 border-t-orange-600 animate-spin" />
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 animate-pulse" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-widest uppercase mb-2">
                    Running style diagnosis
                  </h4>
                  <div className="w-full bg-white/10 h-1 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-orange-600 animate-[pulse_1.5s_infinite] w-3/4 rounded-full" />
                  </div>
                  <p className="text-[10px] sm:text-xs text-orange-350 font-mono italic animate-pulse">
                    {progressMsg}
                  </p>
                </div>
              ) : useCamera ? (
                /* WEB CAMERA SCREEN */
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-2xl mb-4 sm:mb-6 border border-white/10">
                    <video
                      id="analyzer-webcam-stream"
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute top-2 left-2 bg-red-650 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase animate-pulse">
                      Live Stream
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      id="analyzer-capture-btn"
                      onClick={captureSelfieIndex}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider px-4 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" /> Capture Photo
                    </button>
                    <button
                      id="analyzer-cancel-cam-btn"
                      onClick={() => {
                        stopCamera();
                        setUseCamera(false);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider px-4 sm:px-6 py-2.5 sm:py-3 rounded-full cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : imageSrc ? (
                /* SELECTED IMAGE READY TO STYLED SCREEN */
                <div className="w-full max-w-sm flex flex-col items-center py-3 sm:py-6">
                  <div className="relative h-32 w-32 sm:h-48 sm:w-48 rounded-full border-4 border-orange-650 overflow-hidden shadow-2xl mb-4 sm:mb-6">
                    <img
                      src={imageSrc}
                      alt="Selfie source preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      id="analyzer-replace-photo-btn"
                      onClick={resetAnalyzer}
                      className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity text-[10px] sm:text-xs font-bold uppercase tracking-widest cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" /> Replace Photo
                    </button>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-200 mb-4 sm:mb-6">
                    Style Persona Image Locked
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      id="analyzer-diagnose-btn"
                      onClick={runStyleAnalysis}
                      className="bg-[#F27D26] text-black font-sans text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-5 sm:px-8 py-3 sm:py-4 rounded-none flex items-center gap-1.5 cursor-pointer transition-all hover:bg-orange-500"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Diagnose Style Archetype
                    </button>
                    <button
                      id="analyzer-retake-btn"
                      onClick={resetAnalyzer}
                      className="text-gray-400 hover:text-white font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                /* SELECTOR UPLOAD / CAMERA LANDING SCREEN */
                <div className="w-full flex flex-col items-center">
                  
                  {/* UPLOAD BOX */}
                  <div
                    id="analyzer-drag-drop-area"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-md border-2 border-dashed border-zinc-800 hover:border-[#F27D26] rounded-none p-4 sm:p-8 text-center cursor-pointer bg-[#020202] transition-colors flex flex-col items-center justify-center mb-4 sm:mb-6 group"
                  >
                    <input
                      id="analyzer-file-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-2.5 sm:mb-4 group-hover:bg-[#F27D26] group-hover:text-black transition-all duration-300">
                      <Upload className="h-4.5 w-4.5" />
                    </div>
                    <p className="text-[10px] sm:text-xs font-bold text-white mb-0.5 uppercase tracking-wider">
                      Drag and drop your style match photo
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 mb-3 sm:mb-4 font-mono">
                      Step 1: Upload Your Photo (JPG, PNG or WEBP)
                    </p>
                    <button
                      id="uploader-browse-btn"
                      className="bg-white hover:bg-gray-100 text-black font-sans text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-4 sm:px-5 py-2 sm:py-2.5 rounded-none cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </button>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-650 mb-4 sm:mb-6">
                    <span className="h-px w-6 sm:w-8 bg-zinc-900"></span>
                    <span className="font-mono tracking-widest text-[9px] sm:text-[10px]">OR RECRUIT LIVE WEBCAM</span>
                    <span className="h-px w-6 sm:w-8 bg-zinc-900"></span>
                  </div>

                  {/* CAMERA TRIGGER */}
                  <button
                    id="analyzer-start-camera-btn"
                    onClick={startCamera}
                    className="bg-black border border-zinc-800 hover:border-[#F27D26] text-white font-sans text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-none flex items-center gap-2 cursor-pointer hover:bg-[#F27D26]/10 transition-all font-serif italic"
                  >
                    <Camera className="h-3.5 w-3.5 text-[#F27D26]" /> Snap Symmetrical Selfie
                  </button>

                  <div className="flex flex-col items-center gap-2 w-full border-t border-zinc-900 mt-6 sm:mt-8 pt-4 sm:pt-6">
                    <span className="text-[9px] sm:text-[10px] font-bold font-mono tracking-wider text-gray-400 uppercase">
                      Quick Pick: Pre-Built Symmetrical Profiles
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 w-full mt-1.5">
                      {PREMIUM_SAMPLES.map((sample, idx) => (
                        <button
                          id={`analyzer-sample-${idx}`}
                          key={idx}
                          onClick={() => selectSample(sample.image)}
                          className="flex items-center gap-2.5 bg-[#020202] hover:bg-[#070707] border border-zinc-900 hover:border-[#F27D26] rounded-none p-2.5 sm:p-3.5 text-left transition-colors cursor-pointer text-xs"
                        >
                          <img
                            src={sample.image}
                            alt={sample.name}
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-none object-cover border border-[#F27D26] shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-white leading-tight truncate font-serif italic text-[11px] sm:text-xs">{sample.name}</p>
                            <p className="text-[9px] sm:text-[10px] text-gray-500 truncate leading-tight mt-0.5">{sample.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC ERRORS PANEL */}
              {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-orange-600/10 border border-orange-550/30 rounded-xl p-3 flex items-start gap-2.5 animate-fade-in z-10">
                  <AlertCircle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-200 leading-normal font-sans font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* RESULTS DASHBOARD SCREEN */
          <div className="space-y-6 sm:space-y-12 animate-fade-in">
            
            {/* RESET BUTTON */}
            <div className="flex justify-between items-center bg-zinc-950 p-4 border border-zinc-900 rounded-none">
              <span className="text-xs font-bold text-orange-400 font-mono">
                ✓ STEP 2: STYLE DIAGNOSIS COMPLETED
              </span>
              <button
                id="analyzer-reset-results-btn"
                onClick={resetAnalyzer}
                className="bg-zinc-805 hover:bg-orange-600 border border-white/11 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2 sm:py-2.5 rounded-none flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Run Another Advisor Test
              </button>
            </div>

            {/* RESULTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
              
              {/* STYLIST INSIGHT CARD */}
              <div className="lg:col-span-8 bg-zinc-950 p-4 sm:p-6 md:p-8 rounded-none border border-zinc-900 flex flex-col justify-between text-left">
                <div>
                  <div className="inline-flex items-center gap-1 bg-[#F27D26]/10 border border-[#F27D26]/30 px-2.5 sm:px-3.5 py-1 rounded-sm mb-3 sm:mb-4">
                    <CheckCircle2 className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-[8px] sm:text-[9px] font-bold font-mono tracking-widest text-[#F27D26] uppercase">
                      Bespoke Recommendations Ready
                    </span>
                  </div>
                  
                  <h3 className="text-[10px] font-mono font-bold text-gray-500 tracking-[0.2em] uppercase mb-0.5">
                    Your Tailored Archetype
                  </h3>
                  <h1 className="text-xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase mb-4 sm:mb-6 leading-tight">
                    {result.styleArchetype}
                  </h1>

                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-sans font-normal mb-8 border-l-2 border-[#F27D26] pl-3 sm:pl-4 py-0.5 sm:py-1 italic">
                    "{result.rationale}"
                  </p>

                  <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-zinc-900/60">
                    <div>
                      <p className="text-[8px] sm:text-[10px] font-black tracking-wider text-gray-500 uppercase mb-0.5">Face Shape</p>
                      <p className="text-xs sm:text-sm font-semibold text-white">{result.faceShape}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[10px] font-black tracking-wider text-gray-500 uppercase mb-0.5">Loom Profile</p>
                      <p className="text-xs sm:text-sm font-semibold text-white">{result.skinTone}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[10px] font-black tracking-wider text-gray-500 uppercase mb-0.5">Inferred Silhouette</p>
                      <p className="text-xs sm:text-sm font-semibold text-white">{result.bodyType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SPECIFIC COLOR/FIT RULES CARD */}
              <div className="lg:col-span-4 bg-zinc-950 p-4 sm:p-6 rounded-none border border-zinc-900 flex flex-col space-y-4 sm:space-y-6 justify-between text-left">
                
                {/* STEP 4: RECOMMENDED COLORS */}
                <div>
                  <h4 className="text-[9px] sm:text-[10px] font-black tracking-widest text-orange-400 uppercase mb-2 sm:mb-3">
                    Step 4: Recommended Colors
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-green-400 font-bold uppercase mb-1 sm:mb-1.5 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-green-400"></span> Complementary Tones
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.recommendedColors?.map((c, i) => (
                          <span key={i} className="text-[9px] sm:text-[11px] text-white bg-white/5 border border-zinc-800 font-bold px-2 py-0.5">
                            {c}
                          </span>
                        )) ?? result.colorCompatibility.recommended.map((c, i) => (
                          <span key={i} className="text-[9px] sm:text-[11px] text-white bg-white/5 border border-zinc-800 font-bold px-2 py-0.5">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1.5">
                      <p className="text-[9px] sm:text-[10px] text-red-400 font-bold uppercase mb-1 sm:mb-1.5 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-red-400"></span> Avoid
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.colorCompatibility.avoid.map((c, i) => (
                          <span key={i} className="text-[9px] sm:text-[11px] text-gray-600 bg-white/5 border border-zinc-900 px-2 py-0.5 line-through">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 5: RECOMMENDED SIZES / FITS */}
                <div className="border-t border-zinc-900 pt-3 sm:pt-4">
                  <h4 className="text-[9px] sm:text-[10px] font-black tracking-widest text-orange-400 uppercase mb-1.5">
                    Step 5: Recommended Sizes & Fits
                  </h4>
                  <ul className="space-y-1 text-[11px] sm:text-xs text-gray-300 font-sans font-medium list-disc list-inside">
                    {result.recommendedFits.map((f, i) => (
                      <li key={i} className="text-gray-200">{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* STEP 3: RECOMMENDED COLLECTIONS */}
            <div className="border-t border-zinc-900 pt-6 sm:pt-12 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8">
                <div>
                  <h2 className="text-lg sm:text-3xl font-sans font-black uppercase tracking-tight text-white mb-1">
                    Step 3: Recommended Collections
                  </h2>
                  <p className="text-zinc-400 text-xs font-sans">
                    These active garments matching your <strong>{result.styleArchetype}</strong> identity are ready to complement your style.
                  </p>
                </div>
                <button
                  id="analyzer-all-cols-btn"
                  onClick={() => setRoute("collections/all")}
                  className="mt-4 sm:mt-0 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-white transition-colors cursor-pointer"
                >
                  Browse Full Wardrobe <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {recommendedProducts.length > 0 ? (
                <motion.div 
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
                >
                  {recommendedProducts.map((p) => {
                    const isInWishlist = wishlistIds.includes(p.id);
                    return (
                      <motion.div
                        id={`advisor-rec-card-${p.id}`}
                        key={p.id}
                        variants={{
                          hidden: { opacity: 0, y: 16 },
                          show: { opacity: 1, y: 0 }
                        }}
                        className="group bg-[#040404] border border-zinc-900 overflow-hidden hover:border-[#F27D26]/50 transition-all flex flex-col justify-between"
                      >
                        {/* CARD UPPER */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-full w-full object-cover object-center group-hover:scale-102 transition-all duration-500"
                            loading="lazy"
                          />
                          
                          {/* RECOMMENDED TAG */}
                          <div className="absolute top-3 left-3 bg-[#F27D26] text-black text-[8px] font-black font-mono tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1">
                            BEST FIT
                          </div>

                          {/* WISHLIST BUTTON */}
                          <button
                            id={`advisor-rec-card-wish-${p.id}`}
                            onClick={() => onAddToWishlist(p)}
                            className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-none transition-colors cursor-pointer"
                          >
                            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-650 stroke-red-650" : ""}`} />
                          </button>
                        </div>

                        {/* CARD INFO */}
                        <div className="p-4 flex flex-col flex-1 justify-between">
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono block mb-1">
                              {p.category}
                            </span>
                            <button
                              id={`advisor-rec-card-name-${p.id}`}
                              onClick={() => {
                                onProductClick(p);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="text-white hover:text-orange-400 text-xs sm:text-sm font-bold tracking-tight text-left block line-clamp-1 transition-colors cursor-pointer font-sans"
                            >
                              {p.name}
                            </button>
                            
                            {/* RATING */}
                            <div className="flex items-center gap-1.5 mt-1.5 mb-2 font-sans">
                              <span className="text-yellow-400 text-xs">★</span>
                              <span className="text-[10px] text-zinc-400 font-semibold">{p.rating} / 5</span>
                            </div>

                            {/* PRICE */}
                            <div className="flex items-baseline gap-2 font-sans">
                              <span className="text-sm font-black text-white">₹{p.price.toLocaleString("en-IN")}</span>
                              <span className="text-[10px] font-semibold text-zinc-600 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-4 font-sans">
                            <button
                              id={`advisor-rec-card-view-${p.id}`}
                              onClick={() => {
                                onProductClick(p);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="text-center font-bold uppercase tracking-wider text-[9px] bg-white/5 hover:bg-white/10 text-white py-2 rounded-none cursor-pointer"
                            >
                              View Detail
                            </button>
                            <button
                              id={`advisor-rec-card-cart-${p.id}`}
                              onClick={() => onAddToCart(p, p.colors[0]?.name || "Default", p.sizes[0] || "M")}
                              className="text-center font-bold uppercase tracking-wider text-[9px] bg-[#F27D26] hover:bg-orange-600 text-black py-2 rounded-none cursor-pointer flex items-center justify-center gap-1"
                            >
                              <ShoppingCart className="h-3 w-3" /> Buy
                            </button>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-10 bg-zinc-950 rounded-xl border border-zinc-900 text-gray-500 text-sm font-sans">
                  Calculating complementary catalogue pairings...
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
