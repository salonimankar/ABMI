import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { FaceDetection } from '@mediapipe/face_detection';
import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh';
import { RealTimeMetrics } from '../types';

class AnalysisService {
  private poseDetector: poseDetection.PoseDetector | null = null;
  private faceDetector: FaceDetection | null = null;
  private faceMesh: FaceMesh | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js
      await tf.ready();

      // Initialize Pose Detection
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      };
      this.poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );

      // Initialize MediaPipe Face Detection
      this.faceDetector = new FaceDetection({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      this.faceDetector.setOptions({
        selfieMode: false,
        minDetectionConfidence: 0.5,
        model: 'short'
      });

      // Initialize MediaPipe Face Mesh
      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing analysis service:', error);
      throw error;
    }
  }

  async analyzePose(videoElement: HTMLVideoElement): Promise<RealTimeMetrics['posture']> {
    if (!this.poseDetector) {
      throw new Error('Pose detector not initialized');
    }

    const poses = await this.poseDetector.estimatePoses(videoElement);
    if (!poses.length) {
      throw new Error('No pose detected');
    }

    const pose = poses[0];
    const keypoints = pose.keypoints;

    // Calculate metrics
    const backStraightness = this.calculateBackStraightness(keypoints);
    const headTilt = this.calculateHeadTilt(keypoints);
    const bodyLean = this.calculateBodyLean(keypoints);
    const stability = this.calculateStability(keypoints);

    return {
      backStraightness,
      headTilt,
      bodyLean,
      stability,
    };
  }

  async analyzeFacialExpressions(videoElement: HTMLVideoElement): Promise<RealTimeMetrics['emotion']> {
    if (!this.faceDetector || !this.faceMesh) {
      throw new Error('Face detectors not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        this.faceMesh!.onResults((results: FaceMeshResults) => {
          console.log('Face detection results:', {
            hasFace: !!results.multiFaceLandmarks?.length,
            numLandmarks: results.multiFaceLandmarks?.[0]?.length
          });

          if (!results.multiFaceLandmarks || !results.multiFaceLandmarks.length) {
            reject(new Error('No face detected'));
            return;
          }

          const landmarks = results.multiFaceLandmarks[0];
          
          // Analyze facial features using landmarks
          const emotions = this.analyzeLandmarksForEmotions(landmarks);
          
          // Get primary emotion
          const primaryEmotion = Object.entries(emotions)
            .reduce((a, b) => (a[1] > b[1] ? a : b))[0];
          
          console.log('Emotion detection:', {
            emotions,
            primaryEmotion,
            mouthFeatures: {
              mouthCurvature: (landmarks[61].y + landmarks[291].y) / 2 - landmarks[0].y
            }
          });
          
          // Calculate confidence based on landmark detection confidence
          const confidence = results.multiFaceLandmarks[0].some(point => point.visibility ?? 1 > 0.9) ? 0.95 : 0.7;
          
          // Calculate stability using landmark movement
          const stability = this.calculateStabilityFromLandmarks(landmarks);
          
          // Calculate engagement based on face orientation and eye openness
          const engagement = this.calculateEngagementFromLandmarks(landmarks);

          resolve({
            primaryEmotion,
            confidence,
            stability,
            engagement,
          });
        });

        this.faceMesh!.send({image: videoElement});
      } catch (error) {
        reject(error);
      }
    });
  }

  async analyzeVoice(audioData: Float32Array): Promise<RealTimeMetrics['voice']> {
    // Basic audio analysis
    const volume = Math.max(...audioData.map(Math.abs));
    const clarity = this.calculateClarity(audioData);
    const speechRate = this.calculateSpeechRate(audioData);
    const tone = this.calculateTone(audioData);
    const confidence = this.calculateVoiceConfidence(audioData);

    return {
      clarity,
      speechRate,
      tone,
      volume,
      confidence,
    };
  }

  private analyzeLandmarksForEmotions(landmarks: any) {
    const emotions = {
      neutral: 0.5,
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0
    };

    // Example: Detect smile by measuring mouth corners
    const leftMouthCorner = landmarks[61];
    const rightMouthCorner = landmarks[291];
    const upperLip = landmarks[0];
    const lowerLip = landmarks[17];

    // Measure mouth curvature
    const mouthCurvature = (leftMouthCorner.y + rightMouthCorner.y) / 2 - upperLip.y;
    
    if (mouthCurvature > 0.1) {
      emotions.happy = 0.8;
      emotions.neutral = 0.2;
    }

    return emotions;
  }

  private calculateStabilityFromLandmarks(landmarks: any): number {
    // Calculate stability based on landmark movement
    return 0.85;
  }

  private calculateEngagementFromLandmarks(landmarks: any): number {
    // Calculate engagement based on face orientation and eye openness
    return 0.9;
  }

  private calculateBackStraightness(keypoints: poseDetection.Keypoint[]): number {
    // Implementation of back straightness calculation
    return 85; // Example value
  }

  private calculateHeadTilt(keypoints: poseDetection.Keypoint[]): number {
    // Implementation of head tilt calculation
    return 90; // Example value
  }

  private calculateBodyLean(keypoints: poseDetection.Keypoint[]): number {
    // Implementation of body lean calculation
    return 88; // Example value
  }

  private calculateStability(keypoints: poseDetection.Keypoint[]): number {
    // Implementation of stability calculation
    return 92; // Example value
  }

  // Audio analysis methods
  private calculateClarity(audioData: Float32Array): number {
    return 0.8; // Example implementation
  }

  private calculateSpeechRate(audioData: Float32Array): number {
    return 0.75; // Example implementation
  }

  private calculateTone(audioData: Float32Array): number {
    return 0.9; // Example implementation
  }

  private calculateVoiceConfidence(audioData: Float32Array): number {
    return 0.85; // Example implementation
  }
}

export const analysisService = new AnalysisService();