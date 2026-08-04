export interface CourseClassSpec {
  courseCode: string;
  courseName: string;
  classCodes: string[];
}

export interface PackagePreset {
  id: string;
  name: string;
  capacity: string;
  courses: CourseClassSpec[];
}

export const PACKAGE_PRESETS: PackagePreset[] = [
  {
    id: 'paket-1',
    name: 'Paket 1',
    capacity: '51 Mahasiswa',
    courses: [
      { courseCode: 'KOM1303', courseName: 'Analisis Algoritme', classCodes: ['K1', 'R1'] },
      { courseCode: 'KOM1314', courseName: 'Komunikasi Data', classCodes: ['K1', 'P1'] },
      { courseCode: 'KOM1313', courseName: 'Sistem Operasi', classCodes: ['K1', 'P1'] },
      { courseCode: 'KOM133A', courseName: 'Sistem Informasi', classCodes: ['K1'] },
      { courseCode: 'KOM1327', courseName: 'Kecerdasan Buatan', classCodes: ['K1', 'P1'] },
    ],
  },
  {
    id: 'paket-2',
    name: 'Paket 2',
    capacity: '29 Mahasiswa',
    courses: [
      { courseCode: 'KOM1303', courseName: 'Analisis Algoritme', classCodes: ['K2', 'R2'] },
      { courseCode: 'KOM1314', courseName: 'Komunikasi Data', classCodes: ['K2', 'P2'] },
      { courseCode: 'KOM1313', courseName: 'Sistem Operasi', classCodes: ['K2', 'P2'] },
      { courseCode: 'KOM133A', courseName: 'Sistem Informasi', classCodes: ['K1'] },
      { courseCode: 'KOM1327', courseName: 'Kecerdasan Buatan', classCodes: ['K2', 'P2'] },
    ],
  },
  {
    id: 'paket-3',
    name: 'Paket 3',
    capacity: '22 Mahasiswa',
    courses: [
      { courseCode: 'KOM1303', courseName: 'Analisis Algoritme', classCodes: ['K2', 'R2'] },
      { courseCode: 'KOM1314', courseName: 'Komunikasi Data', classCodes: ['K2', 'P2'] },
      { courseCode: 'KOM1313', courseName: 'Sistem Operasi', classCodes: ['K2', 'P2'] },
      { courseCode: 'KOM133A', courseName: 'Sistem Informasi', classCodes: ['K2'] },
      { courseCode: 'KOM1327', courseName: 'Kecerdasan Buatan', classCodes: ['K2', 'P2'] },
    ],
  },
  {
    id: 'paket-4',
    name: 'Paket 4',
    capacity: '24 Mahasiswa',
    courses: [
      { courseCode: 'KOM1303', courseName: 'Analisis Algoritme', classCodes: ['K1', 'R1'] },
      { courseCode: 'KOM1314', courseName: 'Komunikasi Data', classCodes: ['K3', 'P3'] },
      { courseCode: 'KOM1313', courseName: 'Sistem Operasi', classCodes: ['K3', 'P3'] },
      { courseCode: 'KOM133A', courseName: 'Sistem Informasi', classCodes: ['K2'] },
      { courseCode: 'KOM1327', courseName: 'Kecerdasan Buatan', classCodes: ['K1', 'P3'] },
    ],
  },
  {
    id: 'paket-5',
    name: 'Paket 5',
    capacity: '24 Mahasiswa',
    courses: [
      { courseCode: 'KOM1303', courseName: 'Analisis Algoritme', classCodes: ['K2', 'R2'] },
      { courseCode: 'KOM1314', courseName: 'Komunikasi Data', classCodes: ['K3', 'P3'] },
      { courseCode: 'KOM1313', courseName: 'Sistem Operasi', classCodes: ['K3', 'P3'] },
      { courseCode: 'KOM133A', courseName: 'Sistem Informasi', classCodes: ['K2'] },
      { courseCode: 'KOM1327', courseName: 'Kecerdasan Buatan', classCodes: ['K2', 'P3'] },
    ],
  },
];
