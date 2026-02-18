"use client";

import { useState, useRef, useEffect } from "react";

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
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const fetchUploadedDocuments = async () => {
    if (!customer) return;
    try {
      const response = await fetch(`/api/documents?phone=${customer.phone}&name=${customer.name}`);
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

  const handleFileSelect = (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setDocumentUploads((prev) => {
      const newMap = new Map(prev);
      newMap.set(documentType, fileArray);
      return newMap;
    });
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
    if (!privacyConsent) {
      setMessage({ type: "error", text: "개인정보 수집 및 이용에 동의해주세요." });
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
      formData.append("privacyConsent", "true");
      formData.append("status", isSubmit ? "submitted" : "draft");
      for (const [documentType, files] of documentUploads.entries()) {
        formData.append("documentTypes", documentType);
        files.forEach((file) => { formData.append(`files_${documentType}`, file); });
      }
      const response = await fetch("/api/documents/upload", { method: "POST", body: formData });
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
      const response = await fetch(`/api/documents/delete?id=${docId}&phone=${customer.phone}`, { method: "DELETE" });
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">파일 선택</label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleFileSelect(docType, e)}
                          className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 rounded-lg p-1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">카메라 촬영</label>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleFileSelect(docType, e)}
                          className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-indigo-200 rounded-lg p-1 bg-indigo-50/30"
                        />
                      </div>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-xs text-slate-600 truncate">{file.name}</span>
                            <button onClick={() => removeFile(docType, index)} className="text-rose-500 hover:text-rose-700 text-xs font-medium ml-2 shrink-0">
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadedDoc && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <a
                          href={uploadedDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          기존 파일 보기: {uploadedDoc.fileName}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 동의 */}
            <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="docPrivacyConsent"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 mr-3 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <label htmlFor="docPrivacyConsent" className="text-sm text-slate-700">
                  <span className="font-semibold text-rose-600">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                  <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
                    업로드하신 서류와 개인정보는 상담 및 절차 진행 목적으로만 사용됩니다.
                  </span>
                </label>
              </div>
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
