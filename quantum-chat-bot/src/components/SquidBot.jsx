// import React, { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import "./SquidBot.css";

// const SquidBot = () => {
//   const mountRef = useRef(null);

//   useEffect(() => {
//     const currentMount = mountRef.current;
//     if (!currentMount) return;

//     const scene = new THREE.Scene();

//     const camera = new THREE.PerspectiveCamera(
//       60,
//       currentMount.clientWidth / currentMount.clientHeight,
//       0.1,
//       1000
//     );
//     camera.position.set(0, 2, 4);

//     const renderer = new THREE.WebGLRenderer({
//       antialias: true,
//       alpha: true,
//     });

//     renderer.setSize(
//       currentMount.clientWidth,
//       currentMount.clientHeight
//     );

//     renderer.setClearColor(0x000000, 0);
//     renderer.shadowMap.enabled = true;

//     currentMount.appendChild(renderer.domElement);

//     // Lights
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
//     directionalLight.position.set(5, 10, 5);
//     directionalLight.castShadow = true;
//     scene.add(directionalLight);

//     const plane = new THREE.Mesh(
//       new THREE.PlaneGeometry(20, 20),
//       new THREE.ShadowMaterial({ opacity: 0.25 })
//     );
//     plane.rotation.x = -Math.PI / 2;
//     plane.receiveShadow = true;
//     scene.add(plane);

//     const loader = new GLTFLoader();

//     let model;
//     const clock = new THREE.Clock();
//     let loadTime = 0;

//     let specialAnimStarted = false;
//     let specialAnimStartTime = 0;
//     let animationFinished = false;

//     // Target values
//     const targetX = -2.70;  // more left → increase magnitude
//     const targetY = 3.78;   // more up → increase
//     const targetScale = 0.17;   // smaller → reduce

//     loader.load("/squid_bot.glb", (gltf) => {
//       model = gltf.scene;

//       model.traverse((child) => {
//         if (child.isMesh) {
//           child.castShadow = true;
//           child.receiveShadow = true;
//         }
//       });

//       model.position.set(0, 1.5, 0);
//       model.scale.set(1, 1, 1);

//       scene.add(model);
//       loadTime = clock.getElapsedTime();
//     });

// const finalRotationY = 0.49;   // face forward
// const finalRotationX = 0.25;   // no tilt

// const animate = () => {
//   requestAnimationFrame(animate);

//   const elapsed = clock.getElapsedTime();

//   if (model) {

//     // Trigger special animation after 3s
//     if (!specialAnimStarted && elapsed - loadTime > 3) {
//       specialAnimStarted = true;
//       specialAnimStartTime = elapsed;
//     }

//     let targetPosX = 0;
//     let targetPosY = 1.5;
//     let targetScaleNow = 1;
//     let targetRotY = 0;

//     if (specialAnimStarted && !animationFinished) {
//       const animElapsed = elapsed - specialAnimStartTime;
//       const duration = 1;

//       if (animElapsed <= duration) {
//         const progress = animElapsed / duration;
//         const ease = 1 - Math.pow(1 - progress, 3);

//         targetPosX = ease * targetX;
//         targetPosY = 1.5 + ease * (targetY - 1.5);
//         targetScaleNow = 1 - ease * (1 - targetScale);
//         targetRotY = ease * Math.PI * 2.2;
//       } else {
//         animationFinished = true;
//       }
//     }

//     if (animationFinished) {
//       targetPosX = targetX;
//       targetPosY = targetY;
//       targetScaleNow = targetScale;
//       targetRotY = finalRotationY;  // ← straight forward
//     }

//     // Smooth interpolation always
//     model.position.x = THREE.MathUtils.lerp(
//       model.position.x,
//       targetPosX,
//       0.08
//     );

//     model.position.y = THREE.MathUtils.lerp(
//       model.position.y,
//       targetPosY,
//       0.08
//     );

//     model.scale.x = model.scale.y = model.scale.z =
//       THREE.MathUtils.lerp(model.scale.x, targetScaleNow, 0.08);

//     model.rotation.y = THREE.MathUtils.lerp(
//       model.rotation.y,
//       targetRotY,
//       0.08
//     );

//     model.rotation.x = THREE.MathUtils.lerp(
//       model.rotation.x,
//       finalRotationX,
//       0.08
//     );

//     // Smooth base Y
// model.position.y = THREE.MathUtils.lerp(
//   model.position.y,
//   targetPosY,
//   0.08
// );

// // Floating parameters
// const floatSpeed = 2;
// const floatAmount = animationFinished ? 0.005 : 0.075;

// const floatOffset = Math.sin(elapsed * floatSpeed) * floatAmount;

// // Apply float cleanly
// model.position.y += floatOffset;
//   }

//   renderer.render(scene, camera);
// };

//     animate();

//     const handleResize = () => {
//       camera.aspect =
//         currentMount.clientWidth / currentMount.clientHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(
//         currentMount.clientWidth,
//         currentMount.clientHeight
//       );
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (currentMount && renderer.domElement) {
//         currentMount.removeChild(renderer.domElement);
//       }
//       renderer.dispose();
//     };
//   }, []);

//   return <div ref={mountRef} className="squidbot-container" />;
// };

// export default SquidBot;
















// import React, { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import "./SquidBot.css";

// const SquidBot = () => {
//   const mountRef = useRef(null);

//   useEffect(() => {
//     const currentMount = mountRef.current;
//     if (!currentMount) return;

//     // Get dimensions from the container
//     const width = currentMount.clientWidth;
//     const height = currentMount.clientHeight;

//     const scene = new THREE.Scene();
//     // scene.background = new THREE.Color(0x111111); // Black Background

//     const camera = new THREE.PerspectiveCamera(
//       60,
//       width / height,
//       0.1,
//       1000
//     );
//     camera.position.set(0, 2, 4);

//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//     // renderer.setSize(width, height);
//     renderer.setSize(
//       currentMount.clientWidth,
//       currentMount.clientHeight
//     );

//     renderer.setClearColor(0x000000, 0);
//     renderer.shadowMap.enabled = true;

//     currentMount.appendChild(renderer.domElement);

//     // Lighting
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
//     directionalLight.position.set(5, 10, 5);
//     directionalLight.castShadow = true;
//     scene.add(directionalLight);

//     // Ground shadow
//     const plane = new THREE.Mesh(
//       new THREE.PlaneGeometry(20, 20),
//       new THREE.ShadowMaterial({ opacity: 0.35 })
//     );
//     plane.rotation.x = -Math.PI / 2;
//     plane.receiveShadow = true;
//     scene.add(plane);

//     const loader = new GLTFLoader();

//     let model;
//     const clock = new THREE.Clock();

//     let isDragging = false;
//     let lastInteractionTime = 0;

//     // Animation states
//     let animationPhase = 0; // 0: top-right, 1: bottom-left, 2: return to neutral, 3: rotate 360, 4: completed
//     let phaseStartTime = 0;
//     let animationCompleted = false;
    
//     // Target rotations (in radians)
//     const targetRotations = {
//       neutral: { x: 0, y: 0, z: 0 },
//       topRight: { x: -0.5, y: 0.8, z: 0.2 },    // Look up and right
//       bottomLeft: { x: 0.5, y: -0.8, z: -0.2 }   // Look down and left
//     };

//     const initialRotation = new THREE.Euler(0, 0, 0);

//     loader.load("/squid_bot.glb", (gltf) => {
//       model = gltf.scene;

//       model.traverse((child) => {
//         if (child.isMesh) {
//           child.castShadow = true;
//           child.receiveShadow = true;
//         }
//       });

//       model.position.set(0, 1.5, 0); // Stay fixed at center
//       model.rotation.copy(initialRotation);

//       scene.add(model);
      
//       // Start the animation sequence after model loads
//       phaseStartTime = clock.getElapsedTime();
//     });

//     // Mouse controls
//     let previousMousePosition = { x: 0, y: 0 };

//     const onMouseDown = (event) => {
//       isDragging = true;
//       previousMousePosition = {
//         x: event.clientX,
//         y: event.clientY,
//       };
//     };

//     const onMouseMove = (event) => {
//       if (!isDragging || !model || animationCompleted) return;

//       const deltaX = event.clientX - previousMousePosition.x;
//       const deltaY = event.clientY - previousMousePosition.y;

//       model.rotation.y += deltaX * 0.005;
//       model.rotation.x += deltaY * 0.005;

//       previousMousePosition = {
//         x: event.clientX,
//         y: event.clientY,
//       };

//       lastInteractionTime = clock.getElapsedTime();
//     };

//     const onMouseUp = () => {
//       isDragging = false;
//     };

//     window.addEventListener("mousedown", onMouseDown);
//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseup", onMouseUp);

//     const animate = () => {
//       requestAnimationFrame(animate);

//       if (model) {
//         const time = clock.getElapsedTime();
        
//         // Auto animation sequence when not being dragged and animation not completed
//         if (!isDragging && !animationCompleted) {
//           const timeInPhase = time - phaseStartTime;

//           // Phase management
//           if (animationPhase === 0) { // Tilt to top-right corner (2 seconds)
//             const progress = Math.min(timeInPhase / 2, 1);
//             const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
            
//             model.rotation.x = THREE.MathUtils.lerp(
//               targetRotations.neutral.x, 
//               targetRotations.topRight.x, 
//               easeProgress
//             );
//             model.rotation.y = THREE.MathUtils.lerp(
//               targetRotations.neutral.y, 
//               targetRotations.topRight.y, 
//               easeProgress
//             );
//             model.rotation.z = THREE.MathUtils.lerp(
//               targetRotations.neutral.z, 
//               targetRotations.topRight.z, 
//               easeProgress
//             );
            
//             if (progress >= 1) {
//               animationPhase = 1;
//               phaseStartTime = time;
//             }
//           }
//           else if (animationPhase === 1) { // Tilt to bottom-left corner (2 seconds)
//             const progress = Math.min(timeInPhase / 2, 1);
//             const easeProgress = 1 - Math.pow(1 - progress, 3);
            
//             model.rotation.x = THREE.MathUtils.lerp(
//               targetRotations.topRight.x, 
//               targetRotations.bottomLeft.x, 
//               easeProgress
//             );
//             model.rotation.y = THREE.MathUtils.lerp(
//               targetRotations.topRight.y, 
//               targetRotations.bottomLeft.y, 
//               easeProgress
//             );
//             model.rotation.z = THREE.MathUtils.lerp(
//               targetRotations.topRight.z, 
//               targetRotations.bottomLeft.z, 
//               easeProgress
//             );
            
//             if (progress >= 1) {
//               animationPhase = 2;
//               phaseStartTime = time;
//             }
//           }
//           else if (animationPhase === 2) { // Return to neutral (1.5 seconds)
//             const progress = Math.min(timeInPhase / 1.5, 1);
//             const easeProgress = 1 - Math.pow(1 - progress, 3);
            
//             model.rotation.x = THREE.MathUtils.lerp(
//               targetRotations.bottomLeft.x, 
//               targetRotations.neutral.x, 
//               easeProgress
//             );
//             model.rotation.y = THREE.MathUtils.lerp(
//               targetRotations.bottomLeft.y, 
//               targetRotations.neutral.y, 
//               easeProgress
//             );
//             model.rotation.z = THREE.MathUtils.lerp(
//               targetRotations.bottomLeft.z, 
//               targetRotations.neutral.z, 
//               easeProgress
//             );
            
//             if (progress >= 1) {
//               animationPhase = 3;
//               phaseStartTime = time;
//             }
//           }
//           else if (animationPhase === 3) { // Rotate 360 degrees in place (3 seconds)
//             const progress = Math.min(timeInPhase / 3, 1);
            
//             // Stay in neutral position while rotating
//             model.rotation.x = targetRotations.neutral.x;
//             model.rotation.z = targetRotations.neutral.z;
            
//             // Full 360 rotation around Y axis
//             model.rotation.y = progress * Math.PI * 2;
            
//             if (progress >= 1) {
//               animationPhase = 4;
//               animationCompleted = true;
//               model.rotation.y = 0; // Reset to facing forward
//             }
//           }
//         }

//         // Always apply floating motion (subtle up/down) while staying centered
//         const floatOffset = Math.sin(time * 3) * 0.05;
//         model.position.y = 1.5 + floatOffset;
        
//         // Slight scale pulse for extra life (only if animation completed)
//         if (animationCompleted) {
//           const pulseScale = 1 + Math.sin(time * 4) * 0.02;
//           model.scale.set(pulseScale, pulseScale, pulseScale);
//         }
//       }

//       renderer.render(scene, camera);
//     };

//     animate();

//     const handleResize = () => {
//       const newWidth = currentMount.clientWidth;
//       const newHeight = currentMount.clientHeight;
      
//       camera.aspect = newWidth / newHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(newWidth, newHeight);
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("mousedown", onMouseDown);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", onMouseUp);
//       window.removeEventListener("resize", handleResize);

//       if (currentMount && renderer.domElement) {
//         currentMount.removeChild(renderer.domElement);
//       }

//       renderer.dispose();
//     };
//   }, []);

//   return <div ref={mountRef} className="squidbot-container" />;
// };

// export default SquidBot;














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

    // Animation states
    let animationPhase = 0; // 0: top-right, 1: bottom-left, 2: return to neutral, 3: rotate 360, 4: completed
    let phaseStartTime = 0;
    let animationCompleted = false;
    
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
    };

    const onMouseMove = (event) => {
      if (!isDragging || !model || animationCompleted) return;

      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      model.rotation.y += deltaX * 0.005;
      model.rotation.x += deltaY * 0.005;

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };

      lastInteractionTime = clock.getElapsedTime();
    };

    const onMouseUp = () => {
      isDragging = false;
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
            }
          }
        }

        // Always apply floating motion (subtle up/down) while staying centered
        const floatOffset = Math.sin(time * 3) * 0.05;
        model.position.y = 1.5 + floatOffset;
        
        // Slight scale pulse for extra life (only if animation completed)
        if (animationCompleted) {
          const pulseScale = 1 + Math.sin(time * 4) * 0.02;
          model.scale.set(pulseScale, pulseScale, pulseScale);
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