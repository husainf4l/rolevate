'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useVoiceAssistant } from '@livekit/components-react';

interface AudioVisualizer3DProps {
  className?: string;
  isVisible?: boolean;
}

const vertexShader = `
  uniform float u_time;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+10.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  float pnoise(vec3 P, vec3 rep) {
    vec3 Pi0 = mod(floor(P), rep);
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }

  uniform float u_frequency;

  void main() {
    // Increased noise intensity by another 25% (1.875 -> 2.34375)
    float noise = 2.34375 * pnoise(position + u_time * 0.78125, vec3(8.0));
    // Increased displacement by another 25% (48 -> 38.4, 12 -> 9.6)
    float displacement = (u_frequency / 38.4) * (noise / 9.6);
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_red;
  uniform float u_blue;
  uniform float u_green;
  
  void main() {
    gl_FragColor = vec4(vec3(u_red, u_green, u_blue), 1.0);
  }
`;

export function AudioVisualizer3D({ 
  className = '', 
  isVisible = true 
}: AudioVisualizer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    animationId?: number;
    clock: THREE.Clock;
    mesh: THREE.Mesh;
    uniforms: any;
  } | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const { state: agentState, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const agentStateRef = useRef(agentState);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioLevelRef = useRef(0);

  // Update the ref whenever agentState changes
  useEffect(() => {
    agentStateRef.current = agentState;
  }, [agentState]);

  // Setup audio analysis
  useEffect(() => {
    const setupAudioAnalysis = async () => {
      try {
        // Clean up existing context first
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          await audioContextRef.current.close();
          audioContextRef.current = null;
        }

        // Create audio context with better error handling
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume context if suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        // Create analyzer
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;
        analyzerRef.current.smoothingTimeConstant = 0.8;
        
        // Create data array for frequency data
        const bufferLength = analyzerRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Only analyze agent audio if track is available and ready
        if (agentAudioTrack?.publication.track?.mediaStreamTrack) {
          try {
            const mediaStreamTrack = agentAudioTrack.publication.track.mediaStreamTrack;
            
            // Check if the MediaStreamTrack is ready and not ended
            if (mediaStreamTrack.readyState === 'live' && !mediaStreamTrack.muted) {
              // Create a new MediaStream without affecting the original track
              const clonedTrack = mediaStreamTrack.clone();
              const mediaStream = new MediaStream([clonedTrack]);
              
              // Ensure the stream is ready before creating source
              if (mediaStream.active && audioContextRef.current) {
                const agentSource = audioContextRef.current.createMediaStreamSource(mediaStream);
                agentSource.connect(analyzerRef.current);
                console.log('✅ Agent audio analysis connected (microphone disabled)');
              } else {
                console.log('⚠️ Media stream not active or audio context not ready');
              }
            } else {
              console.log('⚠️ Agent audio track not ready:', { 
                readyState: mediaStreamTrack.readyState, 
                muted: mediaStreamTrack.muted 
              });
            }
          } catch (streamError) {
            // This error is expected when tracks are being recreated
            if (streamError instanceof DOMException && streamError.name === 'AbortError') {
              console.debug('🔄 Audio track is being recreated (expected)');
            } else {
              console.warn('⚠️ Could not connect to agent audio stream:', streamError);
            }
          }
        } else {
          console.log('⚠️ Agent audio track not available for analysis');
        }

      } catch (error) {
        console.error('❌ Audio analysis setup failed:', error);
      }
    };

    if (isVisible && isInitialized && agentAudioTrack) {
      // Small delay to prevent race conditions with media loading
      const timer = setTimeout(() => {
        setupAudioAnalysis();
      }, 100);
      
      return () => clearTimeout(timer);
    }

    return () => {
      // Improved cleanup
      const cleanup = async () => {
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          try {
            await audioContextRef.current.close();
          } catch (error) {
            console.warn('Audio context cleanup warning:', error);
          }
          audioContextRef.current = null;
        }
        analyzerRef.current = null;
        dataArrayRef.current = null;
      };
      
      cleanup();
    };
  }, [isVisible, isInitialized, agentAudioTrack?.publication.track?.sid]);

  // Audio analysis loop
  useEffect(() => {
    if (!analyzerRef.current || !dataArrayRef.current) return;

    const analyzeAudio = () => {
      if (!analyzerRef.current || !dataArrayRef.current) return;
      
      if (!dataArrayRef.current) return;

      // Get frequency data
      const dataArray = dataArrayRef.current;
      (analyzerRef.current as any).getByteFrequencyData(dataArray);
      
      // Simple approach: focus on mid-range frequencies for speech
      const midStart = Math.floor(dataArray.length * 0.1);
      const midEnd = Math.floor(dataArray.length * 0.4);
      
      let sum = 0;
      let count = 0;
      
      for (let i = midStart; i < midEnd; i++) {
        sum += dataArray[i];
        count++;
      }
      
      const average = count > 0 ? sum / count : 0;
      
      // Normalize and smooth - very gentle for modern feel
      const normalizedLevel = Math.min(average / 128, 1.0);
      audioLevelRef.current = audioLevelRef.current * 0.85 + normalizedLevel * 0.15;
      
      requestAnimationFrame(analyzeAudio);
    };

    analyzeAudio();
  }, [analyzerRef.current, dataArrayRef.current]);

  // Force initialization test
  const forceInit = () => {
    console.log('🚀 FORCE INIT CLICKED - Starting Three.js setup manually');
    
    if (!mountRef.current) {
      console.error('❌ No mount ref for manual init!');
      return;
    }

    try {
      // Manual Three.js setup
      const width = mountRef.current.clientWidth || window.innerWidth;
      const height = mountRef.current.clientHeight || window.innerHeight;
      
      console.log('📐 Manual setup - Container dimensions:', { width, height });

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      
      // Style the canvas - ensure no borders or backgrounds
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.border = 'none';
      renderer.domElement.style.outline = 'none';
      renderer.domElement.style.background = 'transparent';
      
      mountRef.current.appendChild(renderer.domElement);

      // Create single mesh with moderate vertex displacement (less aggressive than before)
      const geometry = new THREE.IcosahedronGeometry(1.8, 4); // Larger size for better zoom effect
      
      // Create shader uniforms for controlled vertex displacement
      const uniforms = {
        u_time: { value: 0.0 },
        u_frequency: { value: 30.0 }, // Lower base frequency
        u_red: { value: 0.031 },   // Brand color #0891b2 - Red component
        u_green: { value: 0.569 }, // Brand color #0891b2 - Green component
        u_blue: { value: 0.698 }   // Brand color #0891b2 - Blue component
      };

      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      camera.position.z = 6;

      // Store references for animation
      const clock = new THREE.Clock();
      
      sceneRef.current = {
        scene,
        camera,
        renderer,
        clock,
        mesh,
        uniforms
      };

      // Don't start animation here - it will be handled by the separate useEffect
      
      console.log('✅ Manual Three.js setup complete!');
      setIsInitialized(true);
      
    } catch (error) {
      console.error('❌ Manual setup failed:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 3D Visualizer Effect Called');
    
    if (!mountRef.current || !isVisible || isInitialized) {
      console.log('❌ Setup conditions not met:', { 
        hasMount: !!mountRef.current, 
        isVisible,
        isInitialized
      });
      return;
    }

    // Auto-initialize immediately
    const timer = setTimeout(() => {
      console.log('🚀 Auto-initializing Three.js...');
      forceInit();
    }, 100);

    return () => clearTimeout(timer);
  }, [isVisible, isInitialized]);

  // No need for separate audio setup - we'll use LiveKit state

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !isInitialized) {
      console.log('🎬 Animation: Not ready', {
        hasScene: !!sceneRef.current,
        isInitialized
      });
      return;
    }

    console.log('🎬 3D Visualizer: Starting animation loop');

    const animate = () => {
      if (!sceneRef.current) {
        console.log('❌ Animation stopped: sceneRef is null');
        return;
      }

      const { scene, camera, renderer, clock, mesh, uniforms } = sceneRef.current;

      // Get time for animations
      const time = clock.getElapsedTime();
      uniforms.u_time.value = time;

      // Keep your brand color always
      uniforms.u_red.value = 0.031;   // Brand color #0891b2 - Red component
      uniforms.u_green.value = 0.569; // Brand color #0891b2 - Green component
      uniforms.u_blue.value = 0.698;  // Brand color #0891b2 - Blue component

      // Use real audio level for MODERATE vertex displacement (less aggressive than before)
      const audioLevel = audioLevelRef.current;
      const currentAgentState = agentStateRef.current;
      
      // Increased aggressiveness by another 25% (total ~56% from original)
      let baseFrequency = 23.4375; // Increased by another 25% (18.75 * 1.25)
      let audioMultiplier = 1.5625; // Increased by another 25% (1.25 * 1.25)
      
      if (currentAgentState === 'speaking') {
        baseFrequency = 39.0625; // Increased by another 25% (31.25 * 1.25)
        audioMultiplier = 2.34375; // Increased by another 25% (1.875 * 1.25)
      } else if (currentAgentState === 'listening') {
        baseFrequency = 31.25; // Increased by another 25% (25 * 1.25)
        audioMultiplier = 1.875; // Increased by another 25% (1.5 * 1.25)
      } else if (currentAgentState === 'thinking') {
        baseFrequency = 28.125; // Increased by another 25% (22.5 * 1.25)
        audioMultiplier = 1.5625; // Increased by another 25% (1.25 * 1.25)
      } else {
        baseFrequency = 23.4375;
        audioMultiplier = 1.25; // Increased by another 25% (1.0 * 1.25)
      }

      // Calculate frequency for vertex displacement - increased by another 25%
      const audioReactiveFrequency = audioLevel * audioMultiplier * 78.125; // Increased from 62.5 (62.5 * 1.25)
      const frequency = baseFrequency + audioReactiveFrequency;
      
      uniforms.u_frequency.value = frequency;

      // Gentle rotation - keep the nice movement
      mesh.rotation.x += 0.006;
      mesh.rotation.y += 0.008;
      mesh.rotation.z += 0.004;
      
      // NO scaling - size stays consistent, only surface deforms
      mesh.scale.set(1.0, 1.0, 1.0);

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
    };
  }, [isInitialized]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!sceneRef.current || !mountRef.current) return;

      const { camera, renderer } = sceneRef.current;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sceneRef.current) {
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        if (sceneRef.current.renderer) {
          sceneRef.current.renderer.dispose();
        }
        if (sceneRef.current.mesh.material instanceof THREE.Material) {
          sceneRef.current.mesh.material.dispose();
        }
        if (mountRef.current && sceneRef.current.renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(sceneRef.current.renderer.domElement);
        }
        sceneRef.current = null;
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      ref={mountRef} 
      className={`relative w-full h-full ${className}`}
      style={{ 
        width: '100%',
        height: '100%'
      }}
    >

    </div>
  );
}