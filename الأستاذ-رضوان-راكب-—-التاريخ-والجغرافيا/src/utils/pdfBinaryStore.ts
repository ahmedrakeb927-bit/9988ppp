/**
 * Persistent Binary Store for Uploaded PDF Documents (IndexedDB + In-Memory Cache + Base64 Sync)
 * Ensures that any real PDF file uploaded by the teacher is stored byte-for-byte
 * and can be previewed inline or downloaded cleanly across sessions.
 */

const DB_NAME = 'moroccan_bac_pdf_archive_v1';
const STORE_NAME = 'pdf_binaries';
const DB_VERSION = 1;

// Fast in-memory cache so repeated opens of the same PDF resolve in 0ms
const MEMORY_PDF_CACHE = new Map<string, Blob>();

function openPdfDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Failed to open PDF IndexedDB.'));
  });
}

/**
 * Save a raw PDF File/Blob in IndexedDB + memory cache under a deterministic key.
 */
export async function savePdfBinaryToLocalStore(
  storagePath: string,
  fileOrBlob: Blob
): Promise<boolean> {
  if (!storagePath) return false;
  const pdfBlob =
    fileOrBlob.type === 'application/pdf'
      ? fileOrBlob
      : new Blob([fileOrBlob], { type: 'application/pdf' });

  MEMORY_PDF_CACHE.set(storagePath, pdfBlob);

  try {
    const db = await openPdfDatabase();
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(pdfBlob, storagePath);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

/**
 * Retrieve a previously stored PDF Blob from memory cache or IndexedDB.
 */
export async function loadPdfBinaryFromLocalStore(
  storagePath: string
): Promise<Blob | null> {
  if (!storagePath) return null;

  const cached = MEMORY_PDF_CACHE.get(storagePath);
  if (cached && cached.size > 0) {
    return cached;
  }

  try {
    const db = await openPdfDatabase();
    return await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(storagePath);

      req.onsuccess = () => {
        db.close();
        const result = req.result;
        if (result instanceof Blob && result.size > 0) {
          const normalized =
            result.type === 'application/pdf'
              ? result
              : new Blob([result], { type: 'application/pdf' });
          MEMORY_PDF_CACHE.set(storagePath, normalized);
          resolve(normalized);
        } else if (result instanceof ArrayBuffer && result.byteLength > 0) {
          const blob = new Blob([result], { type: 'application/pdf' });
          MEMORY_PDF_CACHE.set(storagePath, blob);
          resolve(blob);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Delete a stored PDF Blob from memory cache & IndexedDB when an exam/resource is deleted.
 */
export async function deletePdfBinaryFromLocalStore(
  storagePath: string
): Promise<void> {
  if (!storagePath) return;
  MEMORY_PDF_CACHE.delete(storagePath);
  try {
    const db = await openPdfDatabase();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(storagePath);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Convert a PDF File/Blob to a base64 Data URL if it fits within Firestore's safe inline budget (~640 KB).
 */
export async function encodePdfBlobToSafeDataUrl(
  blob: Blob,
  maxBytes = 640 * 1024
): Promise<string | null> {
  if (!blob || blob.size === 0 || blob.size > maxBytes) {
    return null;
  }
  return new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
        resolve(reader.result);
      } else {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

/**
 * Decode a `data:application/pdf;base64,...` string back into a valid PDF Blob.
 */
export function decodePdfDataUrlToBlob(dataUrl?: string | null): Blob | null {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return null;
  }
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const base64 = dataUrl.slice(commaIdx + 1);
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    if (len === 0) return null;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
  } catch {
    return null;
  }
}

/**
 * Escape string for PDF literal text `(...)`.
 */
function escapePdfText(input: string): string {
  return (input || '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a valid, standards-compliant multi-page PDF binary (starts with %PDF-1.4, ends with %%EOF)
 * so PDF.js renders crisp structured pages when a fallback document is requested.
 */
export function generateAcademicPdfBlob(params: {
  titleFr: string;
  titleAr?: string;
  subjectFr: string;
  sessionFr?: string;
  year?: number | string;
  levelFr?: string;
  pageCount?: number;
}): Blob {
  const safeTitle = escapePdfText(
    params.titleFr || 'Examen Officiel - Histoire et Geographie'
  );
  const safeSubject = escapePdfText(params.subjectFr || 'Histoire-Geographie');
  const safeSession = escapePdfText(params.sessionFr || 'Session Officielle');
  const safeYear = escapePdfText(String(params.year || new Date().getFullYear()));
  const safeLevel = escapePdfText(params.levelFr || 'Baccalaureat Marocain');
  const totalPages = Math.max(1, Math.min(8, Number(params.pageCount) || 1));

  // Build objects dynamically for 1..totalPages
  const objects: string[] = [];
  // 1: Catalog, 2: Pages, 3: Font Bold, 4: Font Regular
  const firstPageObjNum = 5;
  const pageObjNums: number[] = [];

  for (let p = 1; p <= totalPages; p++) {
    const pageObjId = firstPageObjNum + (p - 1) * 2;
    pageObjNums.push(pageObjId);
  }

  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums
      .map((n) => `${n} 0 R`)
      .join(' ')}] /Count ${totalPages} >>\nendobj\n`
  );
  objects.push(
    `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`
  );
  objects.push(
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
  );

  for (let p = 1; p <= totalPages; p++) {
    const pageObjId = firstPageObjNum + (p - 1) * 2;
    const contentObjId = pageObjId + 1;

    const streamContent = [
      'q',
      // Outer academic double border in gold/navy
      '0.78 0.63 0.39 RG',
      '2 w',
      '36 36 523 770 re S',
      '0.06 0.11 0.17 RG',
      '0.8 w',
      '42 42 511 758 re S',
      // Header banner box
      '0.06 0.11 0.17 rg',
      '42 726 511 74 re f',
      'BT',
      '/F1 13 Tf',
      '0.90 0.78 0.54 rg',
      '60 772 Td',
      '(ROYAUME DU MAROC - MINISTERE DE L EDUCATION NATIONALE) Tj',
      '0 -20 Td',
      '/F2 11 Tf',
      '0.96 0.94 0.89 rg',
      `(Portail Academique du Baccalaureat - ${safeSubject} | Annee ${safeYear}) Tj`,
      '0 -16 Td',
      `/F2 10 Tf (${safeLevel} - ${safeSession} | Page ${p} / ${totalPages}) Tj`,
      // Main Document Body
      '0 -60 Td',
      '0.06 0.11 0.17 rg',
      '/F1 15 Tf',
      `(${safeTitle}) Tj`,
      '0 -26 Td',
      '/F1 11 Tf',
      '0.54 0.41 0.20 rg',
      `(Section ${p} : Cadre Methodologique et Sujet Officiel) Tj`,
      '0 -24 Td',
      '0.12 0.16 0.23 rg',
      '/F2 11 Tf',
      '(1. Premiere partie : Travail sur documents historiques / geographiques (10 pts)) Tj',
      '0 -18 Td',
      '(   - Situer les documents dans leur contexte historique et spatial avec precision.) Tj',
      '0 -18 Td',
      '(   - Definir les concepts et notions cles selon le cadre de reference officiel.) Tj',
      '0 -18 Td',
      '(   - Extraire les informations pertinentes a partir du corpus documentaire.) Tj',
      '0 -18 Td',
      '(   - Degager l idee generale et rediger un paragraphe synthetique argumente.) Tj',
      '0 -32 Td',
      '(2. Deuxieme partie : Redaction d un sujet de dissertation structure (10 pts)) Tj',
      '0 -18 Td',
      '(   - Introduction : Accroche, definition des termes, problematique et annonce du plan.) Tj',
      '0 -18 Td',
      '(   - Developpement : Axes analytiques hierarchises avec exemples historiques/statistiques.) Tj',
      '0 -18 Td',
      '(   - Conclusion : Bilan synthetique repondant a la problematique et ouverture.) Tj',
      '0 -36 Td',
      '/F1 11 Tf',
      '0.06 0.11 0.17 rg',
      '(Consignes officielles d evaluation :) Tj',
      '0 -18 Td',
      '/F2 10 Tf',
      '(   * Respecter la rigueur chronologique et l exactitude terminologique.) Tj',
      '0 -16 Td',
      '(   * Soigner la presentation de la copie, la ponctuation et l articulation logique.) Tj',
      '0 -16 Td',
      '(   * Verifier toutes les donnees avant la remise finale de la copie.) Tj',
      '0 -220 Td',
      '/F2 9 Tf',
      '0.45 0.45 0.45 rg',
      `(Document officiel archive - Portail Marocain Histoire & Geographie - Page ${p} sur ${totalPages}) Tj`,
      'ET',
      'Q',
    ].join('\n');

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`
    );
  }

  let pdfBody = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(pdfBody.length);
    pdfBody += obj;
  }

  const xrefStart = pdfBody.length;
  pdfBody += `xref\n0 ${objects.length + 1}\n`;
  pdfBody += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const off = String(offsets[i]).padStart(10, '0');
    pdfBody += `${off} 00000 n \n`;
  }

  pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new Blob([pdfBody], { type: 'application/pdf' });
}

export const savePdfFileToLocalStore = savePdfBinaryToLocalStore;
export const getPdfFileFromLocalStore = loadPdfBinaryFromLocalStore;
export const deletePdfFileFromLocalStore = deletePdfBinaryFromLocalStore;
export const dataUrlToBlob = (dataUrl: string): Blob | null =>
  decodePdfDataUrlToBlob(dataUrl);

export function buildFallbackAcademicPdfBlob(params: {
  titleLines: string[];
  pageCount?: number;
}): Blob {
  const [line0 = '', line1 = '', line2 = '', line3 = ''] = params.titleLines || [];
  return generateAcademicPdfBlob({
    titleFr: line2 || line1 || 'Document Officiel Baccalaureat',
    subjectFr: line3 || 'Histoire et Geographie',
    sessionFr: line0 || 'Archive Officielle',
    pageCount: params.pageCount || 2,
  });
}

