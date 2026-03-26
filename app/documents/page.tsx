"use client";

import { useState, useRef, useEffect } from "react";
import PrivacyConsentCheckbox, { type ConsentState } from "@/components/PrivacyConsentCheckbox";

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  documentType: string;
  status?: "draft" | "submitted";
  editHistory?: Array<{
    action: string;
    previousFileName?: string;
    previousSavedFileName?: string;
    modifiedAt: string;
  }>;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  birthDate: string;
  requiredDocuments: string[];
}

interface DocumentUpload {
  documentType: string;
  files: File[];
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function DocumentsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [documentUploads, setDocumentUploads] = useState<Map<string, File[]>>(new Map());
  const [consent, setConsent] = useState<ConsentState>({
    privacyConsent: false,
    sensitiveInfoConsent: false,
    overseasTransferConsent: false,
    marketingConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const fetchUploadedDocuments = async () => {
    if (!customer) return;
    try {
      const response = await fetch(`/api/documents?phone=${customer.phone}&name=${customer.name}`, { credentials: "include" });
      const data = await response.json();
      setUploadedDocuments(data);
      const uploadsMap = new Map<string, File[]>();
      data.forEach((doc: Document) => {});
      setDocumentUploads(uploadsMap);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && customer) {
      fetchUploadedDocuments();
    }
  }, [isLoggedIn, customer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const response = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setCustomer(data.customer);
        setIsLoggedIn(true);
        setMessage({ type: "success", text: "로그인되었습니다." });
      } else {
        setLoginError(data.error || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoginLoading(false);
    }
  };

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [reuploadingTypes, setReuploadingTypes] = useState<Set<string>>(new Set());

  const handleFileSelect = (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setDocumentUploads((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(documentType) || [];
      newMap.set(documentType, [...existing, ...fileArray]);
      return newMap;
    });
    e.target.value = "";
  };

  const removeFile = (documentType: string, index: number) => {
    setDocumentUploads((prev) => {
      const newMap = new Map(prev);
      const files = newMap.get(documentType) || [];
      files.splice(index, 1);
      if (files.length === 0) {
        newMap.delete(documentType);
      } else {
        newMap.set(documentType, files);
      }
      return newMap;
    });
  };

  const handleSave = async (isSubmit: boolean = false) => {
    if (!customer) {
      setMessage({ type: "error", text: "로그인이 필요합니다." });
      return;
    }
    if (!consent.privacyConsent || !consent.sensitiveInfoConsent || !consent.overseasTransferConsent) {
      setMessage({ type: "error", text: "필수 동의 항목에 모두 동의해주세요." });
      return;
    }
    if (documentUploads.size === 0) {
      setMessage({ type: "error", text: "최소 하나 이상의 서류를 업로드해주세요." });
      return;
    }
    if (isSubmit) { setSubmitting(true); } else { setSaving(true); }
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("name", customer.name);
      formData.append("phone", customer.phone);
      formData.append("privacyConsent", consent.privacyConsent ? "true" : "false");
      formData.append("sensitiveInfoConsent", consent.sensitiveInfoConsent ? "true" : "false");
      formData.append("overseasTransferConsent", consent.overseasTransferConsent ? "true" : "false");
      formData.append("marketingConsent", consent.marketingConsent ? "true" : "false");
      formData.append("status", isSubmit ? "submitted" : "draft");
      for (const [documentType, files] of documentUploads.entries()) {
        formData.append("documentTypes", documentType);
        files.forEach((file) => { formData.append(`files_${documentType}`, file); });
      }
      const response = await fetch("/api/documents/upload", { method: "POST", body: formData, credentials: "include" });
      const data = await response.json();
      console.log("[서류제출] 응답 status:", response.status, "data:", data);
      if (response.ok) {
        setMessage({ type: "success", text: isSubmit ? "서류가 성공적으로 제출되었습니다." : "서류가 임시저장되었습니다." });
        if (data.documents) {
          setUploadedDocuments((prev) => {
            const existing = prev.filter((doc) => !data.documents.some((newDoc: any) => newDoc.documentType === doc.documentType));
            return [...existing, ...data.documents.map((doc: any) => ({ id: doc.id, fileName: doc.fileName, fileUrl: doc.fileUrl, uploadedAt: doc.uploadedAt, documentType: doc.documentType, status: doc.status }))];
          });
        }
        setDocumentUploads(new Map());
        if (isSubmit) { fetchUploadedDocuments(); }
      } else {
        setMessage({ type: "error", text: data.error || "서류 업로드 중 오류가 발생했습니다." });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setMessage({ type: "error", text: "서류 업로드 중 오류가 발생했습니다." });
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!customer) return;
    if (!confirm("정말 이 서류를 삭제하시겠습니까?")) return;
    setDeletingDocId(docId);
    try {
      const response = await fetch(`/api/documents/delete?id=${docId}&phone=${customer.phone}`, { method: "DELETE", credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "서류가 삭제되었습니다." });
        setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      } else {
        setMessage({ type: "error", text: data.error || "서류 삭제 중 오류가 발생했습니다." });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setMessage({ type: "error", text: "서류 삭제 중 오류가 발생했습니다." });
    } finally {
      setDeletingDocId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
  };

  const getUploadedDocumentTypes = () => uploadedDocuments.map((doc) => doc.documentType);
  const isDocumentUploaded = (docType: string) => getUploadedDocumentTypes().includes(docType);
  const getUploadedDocument = (docType: string) => uploadedDocuments.find((doc) => doc.documentType === docType);

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-sm w-full">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-8 py-6 text-center">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                서류 제출
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                담당자에게 받은 로그인 정보를 입력해주세요
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  휴대폰 번호
                </label>
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="010-0000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  비밀번호 (6자리)
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tracking-widest"
                  placeholder="······"
                />
              </div>

              {loginError && (
                <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-50"
              >
                {loginLoading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <div className="px-8 pb-6 text-center">
              <p className="text-xs text-slate-400">로그인 정보는 담당자가 문자로 보내드립니다.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 로그인 후 화면
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  서류 제출
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {customer?.name}님, 아래 서류를 업로드해주세요
                </p>
              </div>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setCustomer(null);
                  setUploadedDocuments([]);
                  setDocumentUploads(new Map());
                }}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* 필요한 서류 체크리스트 */}
            {customer && customer.requiredDocuments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  제출 필요 서류
                </h2>
                <div className="space-y-2">
                  {customer.requiredDocuments.map((docType) => {
                    const uploadedDoc = getUploadedDocument(docType);
                    const isUploaded = isDocumentUploaded(docType);
                    return (
                      <div
                        key={docType}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isUploaded
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isUploaded ? (
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />
                          )}
                          <span className={`text-sm font-medium ${isUploaded ? "text-emerald-800" : "text-slate-700"}`}>
                            {docType}
                          </span>
                          {uploadedDoc?.status === "submitted" && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">제출됨</span>
                          )}
                          {uploadedDoc?.status === "draft" && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">임시저장</span>
                          )}
                        </div>
                        {isUploaded && (
                          <span className="text-xs text-emerald-600 font-medium">완료</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 서류 업로드 */}
            <div className="space-y-4">
              {customer?.requiredDocuments.map((docType) => {
                const selectedFiles = documentUploads.get(docType) || [];
                const uploadedDoc = getUploadedDocument(docType);
                const isReuploading = reuploadingTypes.has(docType);
                const showUploader = !uploadedDoc || isReuploading;

                return (
                  <div key={docType} className="border border-slate-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900">{docType}</h3>
                      {uploadedDoc && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          uploadedDoc.status === "submitted"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {uploadedDoc.status === "submitted" ? "제출됨" : "임시저장"}
                        </span>
                      )}
                    </div>

                    {uploadedDoc && !isReuploading ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-emerald-800 truncate">{uploadedDoc.fileName}</p>
                            <p className="text-xs text-emerald-600">{uploadedDoc.uploadedAt ? new Date(uploadedDoc.uploadedAt).toLocaleDateString("ko-KR") : ""} 제출</p>
                          </div>
                          <a
                            href={uploadedDoc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-700 font-semibold underline underline-offset-2 shrink-0"
                          >
                            보기
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`"${docType}" 서류를 삭제하고 다시 제출하시겠습니까?`)) {
                              handleDeleteDocument(uploadedDoc.id);
                              setReuploadingTypes((prev) => new Set(prev).add(docType));
                            }
                          }}
                          className="w-full py-2.5 text-sm font-medium text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors"
                        >
                          다시 제출하기
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          ref={(el) => { if (el) fileInputRefs.current[docType] = el; }}
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleFileSelect(docType, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[docType]?.click()}
                          className="w-full flex items-center justify-center gap-2.5 py-4 px-4 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors active:bg-indigo-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                          </svg>
                          사진 촬영 또는 파일 선택
                        </button>
                        {selectedFiles.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            <p className="text-xs font-medium text-slate-500">{selectedFiles.length}개 파일 선택됨</p>
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-emerald-600 text-xs shrink-0">✓</span>
                                  <span className="text-xs text-slate-700 truncate">{file.name}</span>
                                  <span className="text-[10px] text-slate-400 shrink-0">{(file.size / 1024).toFixed(0)}KB</span>
                                </div>
                                <button onClick={() => removeFile(docType, index)} className="text-slate-400 hover:text-rose-500 transition-colors ml-2 shrink-0">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[docType]?.click()}
                              className="w-full py-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                              + 파일 추가
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 동의 */}
            <div className="mt-6">
              <PrivacyConsentCheckbox
                idPrefix="documents"
                consent={consent}
                onChange={setConsent}
                variant="documents"
              />
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleSave(false)}
                disabled={saving || submitting}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-50"
              >
                {saving ? "저장 중..." : "임시저장"}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-50"
              >
                {submitting ? "제출 중..." : "제출하기"}
              </button>
            </div>
          </div>
        </div>

        {/* 제출한 서류 */}
        {uploadedDocuments.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              제출한 서류
            </h2>
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{doc.fileName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.documentType} · {formatDate(doc.uploadedAt)}
                        {doc.status && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                            doc.status === "submitted" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {doc.status === "submitted" ? "제출됨" : "임시저장"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-500 transition-colors"
                      >
                        보기
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingDocId === doc.id}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-medium hover:bg-rose-500 transition-colors disabled:opacity-50"
                      >
                        {deletingDocId === doc.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </div>
                  {doc.editHistory && doc.editHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 mb-1">수정 이력</p>
                      <div className="space-y-0.5">
                        {doc.editHistory.map((history, index) => (
                          <p key={index} className="text-xs text-slate-400">
                            {history.action} · {formatDate(history.modifiedAt)}
                            {history.previousFileName && (
                              <span className="ml-1">(이전: {history.previousFileName})</span>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
