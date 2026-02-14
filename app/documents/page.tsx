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

  // 업로드된 서류 조회
  const fetchUploadedDocuments = async () => {
    if (!customer) return;

    try {
      const response = await fetch(`/api/documents?phone=${customer.phone}&name=${customer.name}`);
      const data = await response.json();
      setUploadedDocuments(data);
      
      // 업로드된 서류를 documentUploads에 반영
      const uploadsMap = new Map<string, File[]>();
      data.forEach((doc: Document) => {
        // 이미 업로드된 서류는 표시만 하고, 파일은 다시 선택할 수 있도록
      });
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
        body: JSON.stringify({
          phone: loginPhone,
          password: loginPassword,
        }),
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

    if (isSubmit) {
      setSubmitting(true);
    } else {
      setSaving(true);
    }
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", customer.name);
      formData.append("phone", customer.phone);
      formData.append("privacyConsent", "true");
      formData.append("status", isSubmit ? "submitted" : "draft");

      // 각 서류 유형별로 파일 업로드
      for (const [documentType, files] of documentUploads.entries()) {
        formData.append("documentTypes", documentType);
        files.forEach((file) => {
          formData.append(`files_${documentType}`, file);
        });
      }

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: isSubmit
            ? "서류가 성공적으로 제출되었습니다."
            : "서류가 임시저장되었습니다.",
        });
        
        // 업로드된 문서 목록 업데이트
        if (data.documents) {
          setUploadedDocuments((prev) => {
            const existing = prev.filter(
              (doc) => !data.documents.some((newDoc: any) => newDoc.documentType === doc.documentType)
            );
            return [...existing, ...data.documents.map((doc: any) => ({
              id: doc.id,
              fileName: doc.fileName,
              fileUrl: doc.fileUrl,
              uploadedAt: doc.uploadedAt,
              documentType: doc.documentType,
              status: doc.status,
            }))];
          });
        }

        // 파일 입력 초기화
        setDocumentUploads(new Map());

        if (isSubmit) {
          // 제출 후 서류 목록 새로고침
          fetchUploadedDocuments();
        }
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
    
    if (!confirm("정말 이 서류를 삭제하시겠습니까?")) {
      return;
    }

    setDeletingDocId(docId);
    try {
      const response = await fetch(`/api/documents/delete?id=${docId}&phone=${customer.phone}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "서류가 삭제되었습니다." });
        // 목록에서 제거
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

  const getUploadedDocumentTypes = () => {
    return uploadedDocuments.map((doc) => doc.documentType);
  };

  const isDocumentUploaded = (docType: string) => {
    return getUploadedDocumentTypes().includes(docType);
  };

  const getUploadedDocument = (docType: string) => {
    return uploadedDocuments.find((doc) => doc.documentType === docType);
  };

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              고객서류관리
            </h1>
            <p className="text-gray-600">
              관리자로부터 받은 로그인 정보를 입력해주세요
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 (아이디)
              </label>
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="010-0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 (4자리)
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0000"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loginLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>로그인 정보는 관리자로부터 문자로 발송됩니다.</p>
          </div>
        </div>
      </main>
    );
  }

  // 로그인 후 화면
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              고객서류관리
            </h1>
            <p className="text-gray-600">
              {customer?.name}님, 필요한 서류를 업로드해주세요
            </p>
          </div>
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setCustomer(null);
              setUploadedDocuments([]);
              setDocumentUploads(new Map());
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 underline"
          >
            로그아웃
          </button>
        </div>

        {/* 필요한 서류 목록 */}
        {customer && customer.requiredDocuments.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              필요한 서류 목록
            </h2>
            <div className="space-y-2">
              {customer.requiredDocuments.map((docType) => {
                const uploadedDoc = getUploadedDocument(docType);
                const isUploaded = isDocumentUploaded(docType);
                return (
                  <div
                    key={docType}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isUploaded
                        ? "bg-green-100 text-green-800"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      {isUploaded ? (
                        <span className="text-green-600 mr-2">✓</span>
                      ) : (
                        <span className="text-gray-400 mr-2">○</span>
                      )}
                      <span className="font-medium">{docType}</span>
                      {uploadedDoc?.status === "submitted" && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          제출됨
                        </span>
                      )}
                      {uploadedDoc?.status === "draft" && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          임시저장
                        </span>
                      )}
                    </div>
                    {isUploaded && (
                      <span className="text-sm text-green-600">업로드 완료</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 서류 업로드 폼 - 각 서류 유형별로 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            서류 업로드
          </h2>

          <div className="space-y-6">
            {customer?.requiredDocuments.map((docType) => {
              const selectedFiles = documentUploads.get(docType) || [];
              const uploadedDoc = getUploadedDocument(docType);
              
              return (
                <div key={docType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{docType}</h3>
                    {uploadedDoc && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        uploadedDoc.status === "submitted"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {uploadedDoc.status === "submitted" ? "제출됨" : "임시저장"}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        파일 선택
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={(e) => handleFileSelect(docType, e)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        📷 카메라로 촬영
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileSelect(docType, e)}
                        className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">휴대폰 카메라로 직접 촬영합니다</p>
                    </div>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            onClick={() => removeFile(docType, index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedDoc && (
                    <div className="mt-3">
                      <a
                        href={uploadedDoc.fileUrl.startsWith("/api/") ? uploadedDoc.fileUrl : `/api/documents/file?file=${uploadedDoc.fileUrl.replace("/uploads/", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        기존 파일 보기: {uploadedDoc.fileName}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="docPrivacyConsent"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 mr-3"
                required
              />
              <label htmlFor="docPrivacyConsent" className="text-sm text-gray-700">
                <span className="font-semibold text-red-600">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                <br />
                <span className="text-xs text-gray-600 mt-1 block">
                  업로드하신 서류와 개인정보는 상담 및 절차 진행 목적으로만 사용되며, 서버에 저장되어 관리자가 확인할 수 있습니다.
                </span>
              </label>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => handleSave(false)}
              disabled={saving || submitting}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "임시저장"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {submitting ? "제출 중..." : "제출"}
            </button>
          </div>
        </div>

        {/* 업로드된 서류 목록 */}
        {uploadedDocuments.length > 0 && (
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              업로드된 서류 목록
            </h2>
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {doc.documentType} • {formatDate(doc.uploadedAt)}
                        {doc.status && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            doc.status === "submitted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {doc.status === "submitted" ? "제출됨" : "임시저장"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <a
                        href={doc.fileUrl.startsWith("/api/") ? doc.fileUrl : `/api/documents/file?file=${doc.fileUrl.replace("/uploads/", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        보기
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingDocId === doc.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deletingDocId === doc.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </div>
                  {doc.editHistory && doc.editHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">수정 이력:</p>
                      <div className="space-y-1">
                        {doc.editHistory.map((history, index) => (
                          <p key={index} className="text-xs text-gray-600">
                            {history.action} - {formatDate(history.modifiedAt)}
                            {history.previousFileName && (
                              <span className="ml-2 text-gray-500">
                                (이전 파일: {history.previousFileName})
                              </span>
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
