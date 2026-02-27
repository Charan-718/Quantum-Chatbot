import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./SquidBot.css";

const SquidBot = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Get dimensions from the container
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x111111); // Black Background

    const camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 2, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      currentMount.clientWidth,
      currentMount.clientHeight
    );

    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;

    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground shadow
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    const loader = new GLTFLoader();

    let model;
    const clock = new THREE.Clock();

    let isDragging = false;
    let lastInteractionTime = 0;
    const INACTIVITY_RESET_DELAY = 2000; // 2 seconds

    // Animation states
    let animationPhase = 0; // 0: top-right, 1: bottom-left, 2: return to neutral, 3: rotate 360, 4: completed
    let phaseStartTime = 0;
    let animationCompleted = false;
    
    // Auto-reset state
    let isResetting = false;
    let resetStartRotation = { x: 0, y: 0, z: 0 };
    let resetStartTime = 0;
    const RESET_DURATION = 1.0; // 1 second for reset animation
    
    // Camera target position after completion
    const initialCameraPos = new THREE.Vector3(0, 2, 4);
    const finalCameraPos = new THREE.Vector3(0, 2, 8);
    let cameraMoveStarted = false;
    
    // Delay before starting animation
    const ANIMATION_DELAY = 1000; // milliseconds
    let animationStarted = false;
    let startTimer = null;
    
    // Target rotations (in radians)
    const targetRotations = {
      neutral: { x: 0, y: 0, z: 0 },
      topRight: { x: -0.5, y: 0.8, z: 0.2 },    // Look up and right
      bottomLeft: { x: 0.5, y: -0.8, z: -0.2 }   // Look down and left
    };

    const initialRotation = new THREE.Euler(0, 0, 0);

    // Store the last user-controlled rotation
    let userControlledRotation = { x: 0, y: 0, z: 0 };

    loader.load("/squid_bot.glb", (gltf) => {
      model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      model.position.set(0, 1.5, 0); // Stay fixed at center
      model.rotation.copy(initialRotation);

      scene.add(model);
      
      // Set a timeout to start animation after delay
      startTimer = setTimeout(() => {
        animationStarted = true;
        phaseStartTime = clock.getElapsedTime();
      }, ANIMATION_DELAY);
    });

    // Mouse controls
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
      
      // If animation is completed, disable it for user control
      if (animationCompleted) {
        // Store the current rotation as the starting point for user control
        if (model) {
          userControlledRotation.x = model.rotation.x;
          userControlledRotation.y = model.rotation.y;
          userControlledRotation.z = model.rotation.z;
        }
        // Cancel any ongoing reset
        isResetting = false;
      }
      
      lastInteractionTime = clock.getElapsedTime();
    };

    const onMouseMove = (event) => {
      if (!isDragging || !model) return;

      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      if (animationCompleted) {
        // User control mode - update from current rotation
        model.rotation.y += deltaX * 0.005;
        model.rotation.x += deltaY * 0.005;
        
        // Clamp x rotation to prevent flipping
        model.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, model.rotation.x));
        
        // Update stored rotation
        userControlledRotation.x = model.rotation.x;
        userControlledRotation.y = model.rotation.y;
        userControlledRotation.z = model.rotation.z;
        
        // Cancel any ongoing reset
        isResetting = false;
      } else {
        // During animation, still allow some control but don't store it
        model.rotation.y += deltaX * 0.005;
        model.rotation.x += deltaY * 0.005;
        
        // Clamp x rotation
        model.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, model.rotation.x));
      }

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };

      lastInteractionTime = clock.getElapsedTime();
    };

    const onMouseUp = () => {
      isDragging = false;
      lastInteractionTime = clock.getElapsedTime();
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const animate = () => {
      requestAnimationFrame(animate);

      if (model) {
        const time = clock.getElapsedTime();
        
        // Auto animation sequence when not being dragged, animation started, and not completed
        if (!isDragging && animationStarted && !animationCompleted) {
          const timeInPhase = time - phaseStartTime;

          // Phase management
          if (animationPhase === 0) { // Tilt to top-right corner (2 seconds)
            const progress = Math.min(timeInPhase / 2, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
            
            model.rotation.x = THREE.MathUtils.lerp(
              targetRotations.neutral.x, 
              targetRotations.topRight.x, 
              easeProgress
            );
            model.rotation.y = THREE.MathUtils.lerp(
              targetRotations.neutral.y, 
              targetRotations.topRight.y, 
              easeProgress
            );
            model.rotation.z = THREE.MathUtils.lerp(
              targetRotations.neutral.z, 
              targetRotations.topRight.z, 
              easeProgress
            );
            
            if (progress >= 1) {
              animationPhase = 1;
              phaseStartTime = time;
            }
          }
          else if (animationPhase === 1) { // Tilt to bottom-left corner (2 seconds)
            const progress = Math.min(timeInPhase / 2, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            model.rotation.x = THREE.MathUtils.lerp(
              targetRotations.topRight.x, 
              targetRotations.bottomLeft.x, 
              easeProgress
            );
            model.rotation.y = THREE.MathUtils.lerp(
              targetRotations.topRight.y, 
              targetRotations.bottomLeft.y, 
              easeProgress
            );
            model.rotation.z = THREE.MathUtils.lerp(
              targetRotations.topRight.z, 
              targetRotations.bottomLeft.z, 
              easeProgress
            );
            
            if (progress >= 1) {
              animationPhase = 2;
              phaseStartTime = time;
            }
          }
          else if (animationPhase === 2) { // Return to neutral (1.5 seconds)
            const progress = Math.min(timeInPhase / 1.5, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            model.rotation.x = THREE.MathUtils.lerp(
              targetRotations.bottomLeft.x, 
              targetRotations.neutral.x, 
              easeProgress
            );
            model.rotation.y = THREE.MathUtils.lerp(
              targetRotations.bottomLeft.y, 
              targetRotations.neutral.y, 
              easeProgress
            );
            model.rotation.z = THREE.MathUtils.lerp(
              targetRotations.bottomLeft.z, 
              targetRotations.neutral.z, 
              easeProgress
            );
            
            if (progress >= 1) {
              animationPhase = 3;
              phaseStartTime = time;
            }
          }
          else if (animationPhase === 3) { // Rotate 360 degrees in place (3 seconds)
            const progress = Math.min(timeInPhase / 3, 1);
            
            // Stay in neutral position while rotating
            model.rotation.x = targetRotations.neutral.x;
            model.rotation.z = targetRotations.neutral.z;
            
            // Full 360 rotation around Y axis
            model.rotation.y = progress * Math.PI * 2;
            
            if (progress >= 1) {
              animationPhase = 4;
              animationCompleted = true;
              model.rotation.y = 0; // Reset to facing forward
              // Store the neutral rotation for user control
              userControlledRotation.x = model.rotation.x;
              userControlledRotation.y = model.rotation.y;
              userControlledRotation.z = model.rotation.z;
              lastInteractionTime = time; // Initialize last interaction time
              console.log("Animation completed, reset timer started"); // Debug
            }
          }
        }

        // After animation completes, smoothly move camera to final position
        if (animationCompleted && !cameraMoveStarted) {
          cameraMoveStarted = true;
        }
        
        if (animationCompleted && cameraMoveStarted) {
          // Smoothly interpolate camera position
          camera.position.lerpVectors(initialCameraPos, finalCameraPos, 0.02);
        }

        // Check for inactivity reset after animation completes
        if (animationCompleted && !isDragging && !isResetting) {
          const timeSinceLastInteraction = time - lastInteractionTime;
          
          // Debug log every second to see if timer is working
          if (Math.floor(time) % 1 === 0) {
            console.log(`Time since last interaction: ${timeSinceLastInteraction.toFixed(2)}s`);
          }
          
          if (timeSinceLastInteraction > INACTIVITY_RESET_DELAY / 1000) {
            console.log("Starting reset animation"); // Debug
            // Start reset animation
            isResetting = true;
            resetStartRotation = {
              x: model.rotation.x,
              y: model.rotation.y,
              z: model.rotation.z
            };
            resetStartTime = time;
          }
        }

        // Handle reset animation
        if (isResetting) {
          const resetProgress = Math.min((time - resetStartTime) / RESET_DURATION, 1);
          const easeProgress = 1 - Math.pow(1 - resetProgress, 3); // Cubic ease-out
          
          model.rotation.x = THREE.MathUtils.lerp(
            resetStartRotation.x,
            targetRotations.neutral.x,
            easeProgress
          );
          model.rotation.y = THREE.MathUtils.lerp(
            resetStartRotation.y,
            targetRotations.neutral.y,
            easeProgress
          );
          model.rotation.z = THREE.MathUtils.lerp(
            resetStartRotation.z,
            targetRotations.neutral.z,
            easeProgress
          );
          
          if (resetProgress >= 1) {
            console.log("Reset animation complete"); // Debug
            isResetting = false;
            // Update stored rotation to neutral
            userControlledRotation.x = targetRotations.neutral.x;
            userControlledRotation.y = targetRotations.neutral.y;
            userControlledRotation.z = targetRotations.neutral.z;
            lastInteractionTime = time; // Reset timer after completion
          }
        }

        // Always apply floating motion (subtle up/down) while staying centered
        const floatOffset = Math.sin(time * 3) * 0.05;
        model.position.y = 1.5 + floatOffset;
        
        // Slight scale pulse for extra life (only if animation completed AND not being dragged AND not resetting)
        if (animationCompleted && !isDragging && !isResetting) {
          const pulseScale = 1 + Math.sin(time * 4) * 0.02;
          model.scale.set(pulseScale, pulseScale, pulseScale);
        } else {
          // When dragging or resetting, keep scale normal
          model.scale.set(1, 1, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);

      if (startTimer) {
        clearTimeout(startTimer);
      }

      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="squidbot-container" />;
};

export default SquidBot;