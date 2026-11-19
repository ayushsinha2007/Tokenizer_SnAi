import { PcaResult, SentenceItem } from './types';

function powerIteration(matrix: number[][], iterations: number = 80): { eigenvalue: number; eigenvector: number[] } {
  const n = matrix.length;
  // Initialize with deterministic pseudo-random vector for reproducibility
  let vec = new Array(n).fill(0).map((_, i) => Math.sin(i + 1) * 0.5 + 0.1);
  let norm = Math.hypot(...vec);
  if (norm < 1e-12) {
    vec[0] = 1;
    norm = 1;
  }
  vec = vec.map(v => v / norm);

  let eigenvalue = 0;
  for (let iter = 0; iter < iterations; iter++) {
    const nextVec = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += matrix[i][j] * vec[j];
      }
      nextVec[i] = sum;
    }

    norm = Math.hypot(...nextVec);
    if (norm < 1e-12) break;
    vec = nextVec.map(v => v / norm);
    eigenvalue = norm;
  }

  return { eigenvalue, eigenvector: vec };
}

function matrixDeflate(matrix: number[][], eigenvalue: number, eigenvector: number[]): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i][j] = matrix[i][j] - eigenvalue * eigenvector[i] * eigenvector[j];
    }
  }
  return result;
}

export function runDualPca(sentences: SentenceItem[]): PcaResult {
  const validItems = sentences.filter(s => s.vector && s.vector.length > 0);
  const n = validItems.length;

  if (n === 0) {
    return {
      coordinates: [],
      explainedVariance: [33.3, 33.3, 33.3],
      eigenvalues: [1, 1, 1],
    };
  }

  const d = validItems[0].vector!.length;

  // Edge cases for very small N (< 3)
  if (n < 3) {
    const coords = validItems.map((s, idx) => ({
      id: s.id,
      x: idx === 0 ? -4 : 4,
      y: 0,
      z: 0,
    }));
    return {
      coordinates: coords,
      explainedVariance: [70.0, 20.0, 10.0],
      eigenvalues: [10, 5, 1],
    };
  }

  // 1. Calculate centroid / mean vector
  const meanVector = new Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    const vec = validItems[i].vector!;
    for (let j = 0; j < d; j++) {
      meanVector[j] += vec[j] / n;
    }
  }

  // 2. Centered matrix B
  const centeredMatrix: number[][] = validItems.map(s => {
    return s.vector!.map((val, col) => val - meanVector[col]);
  });

  // 3. Gram matrix G = B * B^T (size N x N)
  const gramMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let totalGramTrace = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let dot = 0;
      for (let k = 0; k < d; k++) {
        dot += centeredMatrix[i][k] * centeredMatrix[j][k];
      }
      gramMatrix[i][j] = dot;
      gramMatrix[j][i] = dot;
    }
    totalGramTrace += gramMatrix[i][i];
  }

  // 4. Extract top 3 eigenvectors using Power Iteration & Deflation
  let currentMatrix = gramMatrix;
  const eigenvalues: [number, number, number] = [0, 0, 0];
  const eigenvectors: number[][] = [];

  for (let comp = 0; comp < 3; comp++) {
    const { eigenvalue, eigenvector } = powerIteration(currentMatrix, 90);
    eigenvalues[comp] = Math.max(eigenvalue, 0.0001);
    eigenvectors.push(eigenvector);
    currentMatrix = matrixDeflate(currentMatrix, eigenvalue, eigenvector);
  }

  // 5. Projected coordinates: coordinate = sqrt(lambda) * eigenvector[i]
  const rawCoords: { id: string; x: number; y: number; z: number }[] = [];
  let maxX = 0.001;
  let maxY = 0.001;
  let maxZ = 0.001;

  for (let i = 0; i < n; i++) {
    const x = Math.sqrt(eigenvalues[0]) * eigenvectors[0][i];
    const y = Math.sqrt(eigenvalues[1]) * eigenvectors[1][i];
    const z = Math.sqrt(eigenvalues[2]) * eigenvectors[2][i];

    if (Math.abs(x) > maxX) maxX = Math.abs(x);
    if (Math.abs(y) > maxY) maxY = Math.abs(y);
    if (Math.abs(z) > maxZ) maxZ = Math.abs(z);

    rawCoords.push({ id: validItems[i].id, x, y, z });
  }

  // 6. Scale coordinates uniformly to fit a comfortable 3D arena range [-6.5, 6.5]
  const globalMax = Math.max(maxX, maxY, maxZ, 0.001);
  const targetScale = 6.2;
  const scaleFactor = targetScale / globalMax;

  const normalizedCoords = rawCoords.map(c => ({
    id: c.id,
    x: Number((c.x * scaleFactor).toFixed(3)),
    y: Number((c.y * scaleFactor).toFixed(3)),
    z: Number((c.z * scaleFactor).toFixed(3)),
  }));

  // 7. Calculate Explained Variance ratio (%)
  const totalVariance = totalGramTrace > 0.0001 
    ? totalGramTrace 
    : eigenvalues[0] + eigenvalues[1] + eigenvalues[2];

  const explainedVariance: [number, number, number] = [
    Number(((eigenvalues[0] / totalVariance) * 100).toFixed(1)),
    Number(((eigenvalues[1] / totalVariance) * 100).toFixed(1)),
    Number(((eigenvalues[2] / totalVariance) * 100).toFixed(1)),
  ];

  return {
    coordinates: normalizedCoords,
    explainedVariance,
    eigenvalues,
  };
}
