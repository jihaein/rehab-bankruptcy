"use client";

import { useState, useEffect } from "react";

interface Submission {
  name: string;
  phone: string;
  totalDebt?: string;
  debtIncrease?: string;
  monthlyIncome?: string;
  seizureStatus?: string;
  assets?: string;
  creditors?: string;
  dependents?: string;
  age?: number;
  totalDebtNum?: number;
  monthlyIncomeNum?: number;
  monthlyExpense?: number;
  assetsNum?: number;
  employmentStatus?: string;
  debtType?: string[];
  hasFutureIncome?: boolean | null;
  realEstateMortgage?: boolean | null;
  realEstateDebt?: number;
  carMortgage?: boolean | null;
  carDebt?: number;
  unsecuredDebtPrincipal?: number;
  unsecuredDebtInterest?: number;
  depositInsurance?: number;
  carMotorcycle?: number;
  deposit?: number;
  realEstate?: number;
  businessEquipment?: number;
  expectedSeverance?: number;
  attachmentDeposit?: number;
  otherAssets?: number;
  monthlyNetIncome?: number;
  dependentsNum?: number;
  additionalInfo: string;
  result: {
    eligible: boolean;
    explanation: string;
    recommendation: string;
  };
  submittedAt: string;
}

interface Document {
  id: string;
  name: string;
  phone: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  editHistory?: Array<{
    action: string;
    previousFileName?: string;
    previousSavedFileName?: string;
    modifiedAt: string;
  }>;
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"submissions" | "documents" | "register">("submissions");
  
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    birthDate: "",
    requiredDocuments: [] as string[],
  });
  const [customDocumentName, setCustomDocumentName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [smsSent, setSmsSent] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    birthDate: "",
    requiredDocuments: [] as string[],
    password: "",
  });
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editCustomDocumentName, setEditCustomDocumentName] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAuthenticated(true);
        setPassword("");
        fetchSubmissions();
      } else {
        alert(data.error || "비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/admin/submissions", { credentials: "include" });
      if (response.status === 401) { setAuthenticated(false); alert("인증이 만료되었습니다. 다시 로그인해주세요."); return; }
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }
      });
      if (response.status === 401) { setAuthenticated(false); alert("인증이 만료되었습니다. 다시 로그인해주세요."); return; }
      if (!response.ok) {
        const errText = await response.text();
        console.error("Documents API error:", response.status, errText);
        alert(`서류 목록 불러오기 실패 (${response.status})`);
        setDocuments([]);
        return;
      }
      const data = await response.json();
      console.log("Fetched documents:", data);
      if (Array.isArray(data)) { setDocuments(data); } else { setDocuments([]); }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers", { credentials: "include" });
      if (response.status === 401) { setAuthenticated(false); alert("인증이 만료되었습니다. 다시 로그인해주세요."); return; }
      if (!response.ok) { setCustomers([]); return; }
      let data;
      try { data = await response.json(); } catch { setCustomers([]); return; }
      if (Array.isArray(data)) { setCustomers(data); } else { setCustomers([]); }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    if (authenticated) {
      if (activeTab === "documents") { setDocuments([]); fetchDocuments(); }
      else if (activeTab === "register") { fetchCustomers(); }
    }
  }, [authenticated, activeTab]);

  useEffect(() => {
    if (authenticated && activeTab === "documents") { fetchDocuments(); }
  }, [activeTab]);

  const documentTypes = ["신분증", "소득증명서", "부채증명서", "자산증명서", "은행거래내역", "기타"];

  const handleDocumentCheckbox = (docType: string) => {
    setCustomerForm((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.includes(docType)
        ? prev.requiredDocuments.filter((d) => d !== docType)
        : [...prev.requiredDocuments, docType],
    }));
  };

  const handleAddCustomDocument = () => {
    if (!customDocumentName.trim()) { setRegisterMessage({ type: "error", text: "서류 이름을 입력해주세요." }); return; }
    if (customerForm.requiredDocuments.includes(customDocumentName.trim())) { setRegisterMessage({ type: "error", text: "이미 추가된 서류입니다." }); return; }
    setCustomerForm((prev) => ({ ...prev, requiredDocuments: [...prev.requiredDocuments, customDocumentName.trim()] }));
    setCustomDocumentName("");
    setRegisterMessage(null);
  };

  const handleRemoveDocument = (docType: string) => {
    setCustomerForm((prev) => ({ ...prev, requiredDocuments: prev.requiredDocuments.filter((d) => d !== docType) }));
  };

  const handleRegisterCustomer = async () => {
    if (!customerForm.name || !customerForm.phone) { setRegisterMessage({ type: "error", text: "이름과 전화번호를 입력해주세요." }); return; }
    if (customerForm.requiredDocuments.length === 0) { setRegisterMessage({ type: "error", text: "최소 하나 이상의 서류를 선택해주세요." }); return; }
    setRegistering(true); setRegisterMessage(null); setSmsSent(false);
    try {
      const response = await fetch("/api/admin/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(customerForm), credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        setRegisterMessage({ type: "success", text: "고객이 성공적으로 등록되었습니다." });
        setGeneratedPassword(data.customer.password);
        setCustomerForm({ name: "", phone: "", birthDate: "", requiredDocuments: [] });
        setCustomDocumentName("");
        fetchCustomers();
      } else { setRegisterMessage({ type: "error", text: data.error || "고객 등록 중 오류가 발생했습니다." }); }
    } catch (error) { setRegisterMessage({ type: "error", text: "고객 등록 중 오류가 발생했습니다." }); } finally { setRegistering(false); }
  };

  const handleSendSMS = async () => {
    if (!customerForm.phone || !generatedPassword) { setRegisterMessage({ type: "error", text: "고객을 먼저 등록해주세요." }); return; }
    try {
      const siteUrl = window.location.origin;
      const response = await fetch("/api/admin/send-sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: customerForm.phone, name: customerForm.name, password: generatedPassword, requiredDocuments: customerForm.requiredDocuments, siteUrl }) });
      const data = await response.json();
      if (response.ok) {
        setSmsSent(true);
        setRegisterMessage({ type: "success", text: "문자 메시지가 발송되었습니다." });
        if (data.simulatedMessage) { console.log("발송된 메시지 내용:", data.simulatedMessage); }
      } else { setRegisterMessage({ type: "error", text: data.error || "문자 발송 중 오류가 발생했습니다." }); }
    } catch (error) { setRegisterMessage({ type: "error", text: "문자 발송 중 오류가 발생했습니다." }); }
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setEditForm({ name: customer.name, phone: customer.phone, birthDate: customer.birthDate, requiredDocuments: customer.requiredDocuments || [], password: customer.password || "" });
    setEditCustomDocumentName("");
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    if (!editForm.name || !editForm.phone || editForm.requiredDocuments.length === 0) { setRegisterMessage({ type: "error", text: "이름, 전화번호, 그리고 필요한 서류를 선택해주세요." }); return; }
    setUpdating(true); setRegisterMessage(null);
    try {
      const response = await fetch("/api/admin/customers", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id: editingCustomer.id, ...editForm }) });
      const data = await response.json();
      if (response.ok) { setRegisterMessage({ type: "success", text: "고객 정보가 업데이트되었습니다." }); setEditingCustomer(null); fetchCustomers(); }
      else { setRegisterMessage({ type: "error", text: data.error || "업데이트 중 오류가 발생했습니다." }); }
    } catch (error) { setRegisterMessage({ type: "error", text: "업데이트 중 오류가 발생했습니다." }); } finally { setUpdating(false); }
  };

  const handleEditDocumentCheckbox = (docType: string) => {
    setEditForm((prev) => ({ ...prev, requiredDocuments: prev.requiredDocuments.includes(docType) ? prev.requiredDocuments.filter((d) => d !== docType) : [...prev.requiredDocuments, docType] }));
  };

  const handleAddEditCustomDocument = () => {
    if (!editCustomDocumentName.trim()) { setRegisterMessage({ type: "error", text: "서류 이름을 입력해주세요." }); return; }
    if (editForm.requiredDocuments.includes(editCustomDocumentName.trim())) { setRegisterMessage({ type: "error", text: "이미 추가된 서류입니다." }); return; }
    setEditForm((prev) => ({ ...prev, requiredDocuments: [...prev.requiredDocuments, editCustomDocumentName.trim()] }));
    setEditCustomDocumentName("");
    setRegisterMessage(null);
  };

  const handleRemoveEditDocument = (docType: string) => {
    setEditForm((prev) => ({ ...prev, requiredDocuments: prev.requiredDocuments.filter((d) => d !== docType) }));
  };

  const formatCurrency = (amount: number) => {
    const eok = Math.floor(amount / 10000);
    const man = amount % 10000;
    if (eok > 0) { return man > 0 ? `${eok}억 ${man}만원` : `${eok}억원`; }
    return `${man}만원`;
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString("ko-KR");

  const handleDeleteSubmission = async (submission: Submission) => {
    if (!confirm("정말로 이 진단내역을 삭제하시겠습니까?")) return;
    try {
      const submissionId = (submission as any).id;
      const url = submissionId ? `/api/admin/submissions?id=${submissionId}` : `/api/admin/submissions?index=${submissions.indexOf(submission)}`;
      const response = await fetch(url, { method: "DELETE", credentials: "include" });
      if (response.ok) { fetchSubmissions(); } else { const d = await response.json(); alert(d.error || "삭제 중 오류가 발생했습니다."); }
    } catch (error) { alert("삭제 중 오류가 발생했습니다."); }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("정말로 이 고객을 삭제하시겠습니까? 관련 서류도 함께 삭제됩니다.")) return;
    try {
      const response = await fetch(`/api/admin/customers?id=${id}`, { method: "DELETE", credentials: "include" });
      if (response.ok) { fetchCustomers(); fetchDocuments(); } else { alert("삭제 중 오류가 발생했습니다."); }
    } catch (error) { alert("삭제 중 오류가 발생했습니다."); }
  };

  const handleDeleteDocument = async (documentId: string, phone: string) => {
    if (!confirm("정말로 이 서류를 삭제하시겠습니까?")) return;
    try {
      const response = await fetch(`/api/documents/delete?id=${documentId}&phone=${phone}`, { method: "DELETE", credentials: "include" });
      const responseData = await response.json();
      if (response.ok) { setDocuments([]); setTimeout(() => { fetchDocuments(); }, 200); }
      else { alert(responseData.error || "삭제 중 오류가 발생했습니다."); setTimeout(() => { fetchDocuments(); }, 200); }
    } catch (error) { alert("삭제 중 오류가 발생했습니다."); await fetchDocuments(); }
  };

  const handleRegisterFromSubmission = (submission: Submission) => {
    setCustomerForm({ name: submission.name, phone: submission.phone, birthDate: "", requiredDocuments: [] });
    setActiveTab("register");
    setTimeout(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, 100);
  };

  const filteredSubmissions = submissions.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCustomers = customers.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDocuments = documents.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // 로그인
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-8 py-6 text-center">
            <h1 className="text-xl font-bold text-white tracking-tight">관리자 로그인</h1>
          </div>
          <div className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button onClick={handleLogin} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150">
              로그인
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">불러오는 중...</div>
      </main>
    );
  }

  const tabClass = (tab: string) =>
    `px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${
      activeTab === tab
        ? "border-indigo-600 text-indigo-600"
        : "border-transparent text-slate-400 hover:text-slate-600"
    }`;

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">관리자 대시보드</h1>
            <button
              onClick={() => { setAuthenticated(false); setPassword(""); }}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              로그아웃
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-8 border-b border-slate-200">
            <button onClick={() => { setActiveTab("submissions"); setSearchQuery(""); fetchSubmissions(); }} className={tabClass("submissions")}>
              진단 내역
            </button>
            <button onClick={() => { setActiveTab("documents"); setSearchQuery(""); fetchDocuments(); }} className={tabClass("documents")}>
              고객 서류
            </button>
            <button onClick={() => { setActiveTab("register"); setSearchQuery(""); fetchCustomers(); }} className={tabClass("register")}>
              고객 관리
            </button>
          </div>

          <div className="p-8">
            {/* 검색 */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-sm px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 진단 내역 탭 */}
            {activeTab === "submissions" && (
              <>
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    {searchQuery ? "검색 결과가 없습니다." : "아직 접수된 진단이 없습니다."}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map((submission, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-base font-bold text-slate-900">
                              {submission.name}{submission.age ? ` (${submission.age}세)` : ""}
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">{submission.phone}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{formatDate(submission.submittedAt)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                            submission.result.eligible
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {submission.result.eligible ? "가능성 높음" : "가능성 낮음"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">재무 정보</h3>
                            {submission.totalDebt && typeof submission.totalDebt === "string" ? (
                              <ul className="space-y-1 text-sm text-slate-600">
                                <li>총 채무: {submission.totalDebt === "over100m" ? "1억 이상" : submission.totalDebt === "7k-100m" ? "7천~1억" : submission.totalDebt === "3k-7k" ? "3천~7천" : "3천 미만"}</li>
                                <li>채무 증가: {submission.debtIncrease === "over3k" ? "3천 이상" : submission.debtIncrease === "1k-3k" ? "1천~3천" : submission.debtIncrease === "under1k" ? "1천 미만" : "없음"}</li>
                                <li>월 소득: {submission.monthlyIncome === "over300" ? "300 이상" : submission.monthlyIncome === "200-300" ? "200~300" : submission.monthlyIncome === "150-200" ? "150~200" : "150 미만"}만원</li>
                                <li>압류·독촉: {submission.seizureStatus === "salary" ? "급여 압류" : submission.seizureStatus === "account" ? "통장 압류" : submission.seizureStatus === "collection" ? "독촉만" : "없음"}</li>
                                <li>재산: {submission.assets === "over100m" ? "1억 이상" : submission.assets === "3k-100m" ? "3천~1억" : submission.assets === "under3k" ? "3천 미만" : "없음"}</li>
                                <li>채권자: {submission.creditors === "over8" ? "8곳 이상" : submission.creditors === "4-7" ? "4~7곳" : "1~3곳"}</li>
                                <li>부양가족: {submission.dependents === "over3" ? "3명 이상" : submission.dependents === "2" ? "2명" : submission.dependents === "1" ? "1명" : "없음"}</li>
                              </ul>
                            ) : submission.totalDebtNum !== undefined ? (
                              <ul className="space-y-1 text-sm text-slate-600">
                                <li>총 부채: {formatCurrency(submission.totalDebtNum)}</li>
                                <li>월 소득: {submission.monthlyIncomeNum}만원</li>
                                <li>월 지출: {submission.monthlyExpense}만원</li>
                                <li>자산: {formatCurrency(submission.assetsNum || 0)}</li>
                              </ul>
                            ) : (
                              <ul className="space-y-1 text-sm text-slate-600">
                                <li>총 채권액: {formatCurrency((submission.realEstateDebt || 0) + (submission.carDebt || 0) + (submission.unsecuredDebtPrincipal || 0) + (submission.unsecuredDebtInterest || 0))}</li>
                                <li>총 재산액: {formatCurrency((submission.depositInsurance || 0) + (submission.carMotorcycle || 0) + (submission.deposit || 0) + (submission.realEstate || 0) + (submission.businessEquipment || 0) + (submission.expectedSeverance || 0) + (submission.attachmentDeposit || 0) + (submission.otherAssets || 0))}</li>
                                <li>월 순수입: {submission.monthlyNetIncome || 0}만원</li>
                                <li>부양가족: {submission.dependentsNum || 0}명</li>
                              </ul>
                            )}
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">진단 분석</h3>
                            <div className="space-y-2 text-sm text-slate-600">
                              <div>
                                <p className="font-medium text-slate-700 text-xs mb-1">분석 결과</p>
                                <p className="whitespace-pre-line text-xs leading-relaxed">{submission.result.explanation}</p>
                              </div>
                              <div>
                                <p className="font-medium text-slate-700 text-xs mb-1">추천 방향</p>
                                <p className="whitespace-pre-line text-xs leading-relaxed">{submission.result.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {submission.additionalInfo && (
                          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 font-medium mb-1">추가 정보</p>
                            <p className="text-sm text-slate-600">{submission.additionalInfo}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t border-slate-100">
                          <button onClick={() => handleRegisterFromSubmission(submission)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors">
                            고객 등록
                          </button>
                          <a href={`tel:${submission.phone}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors">
                            전화하기
                          </a>
                          <button onClick={() => handleDeleteSubmission(submission)} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-md transition-colors">
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 고객 서류 탭 */}
            {activeTab === "documents" && (
              <>
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    {searchQuery ? "검색 결과가 없습니다." : "아직 제출된 서류가 없습니다."}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(
                      filteredDocuments.reduce((acc: any, doc) => {
                        const key = `${doc.name}_${doc.phone}`;
                        if (!acc[key]) { acc[key] = { name: doc.name, phone: doc.phone, documents: [] }; }
                        acc[key].documents.push(doc);
                        return acc;
                      }, {})
                    ).map(([key, customer]: [string, any]) => (
                      <div key={key} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-base font-bold text-slate-900">{customer.name}</h2>
                            <p className="text-sm text-slate-500 mt-0.5">{customer.phone}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{customer.documents.length}건</p>
                          </div>
                          <a href={`tel:${customer.phone}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors">
                            전화하기
                          </a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {customer.documents.map((doc: Document) => (
                            <div key={doc.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                              <p className="text-sm font-semibold text-slate-900">{doc.documentType}</p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{doc.fileName}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{formatDate(doc.uploadedAt)}</p>
                              {doc.editHistory && doc.editHistory.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <p className="text-xs text-slate-400 mb-0.5">수정 이력</p>
                                  {doc.editHistory.map((h, i) => (
                                    <p key={i} className="text-xs text-slate-400">{h.action} · {formatDate(h.modifiedAt)}</p>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-2 mt-3">
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 text-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors"
                                >
                                  보기
                                </a>
                                <button onClick={() => handleDeleteDocument(doc.id, doc.phone)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-md transition-colors">
                                  삭제
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 고객 관리 탭 */}
            {activeTab === "register" && (
              <div className="space-y-6">
                {/* 새 고객 등록 */}
                <div className="border border-slate-200 rounded-lg p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-4">새 고객 등록</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1.5">이름 <span className="text-rose-500">*</span></label>
                      <input type="text" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="홍길동" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1.5">전화번호 <span className="text-rose-500">*</span></label>
                      <input type="tel" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="010-0000-0000" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">필요한 서류 <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {documentTypes.map((docType) => (
                        <label key={docType} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all text-sm ${
                          customerForm.requiredDocuments.includes(docType)
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}>
                          <input type="checkbox" checked={customerForm.requiredDocuments.includes(docType)} onChange={() => handleDocumentCheckbox(docType)} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-slate-700">{docType}</span>
                        </label>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">서류 직접 추가</label>
                      <div className="flex gap-2">
                        <input type="text" value={customDocumentName} onChange={(e) => setCustomDocumentName(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAddCustomDocument()} placeholder="예: 건강보험증, 통장사본" className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        <button type="button" onClick={handleAddCustomDocument} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">추가</button>
                      </div>
                    </div>

                    {customerForm.requiredDocuments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {customerForm.requiredDocuments.map((docType) => (
                          <span key={docType} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-xs font-medium text-indigo-800">
                            {docType}
                            <button type="button" onClick={() => handleRemoveDocument(docType)} className="text-indigo-400 hover:text-rose-600 font-bold">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {registerMessage && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${registerMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                      {registerMessage.text}
                    </div>
                  )}

                  {generatedPassword && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
                      <p className="text-sm text-amber-800">
                        <strong>생성된 비밀번호:</strong> <span className="font-mono">{generatedPassword}</span>
                      </p>
                      <p className="text-xs text-amber-600 mt-0.5">이 비밀번호가 고객에게 문자로 발송됩니다.</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={handleRegisterCustomer} disabled={registering} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-50 text-sm">
                      {registering ? "등록 중..." : "고객 등록"}
                    </button>
                    {generatedPassword && !smsSent && (
                      <button onClick={handleSendSMS} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 text-sm">
                        문자 발송
                      </button>
                    )}
                  </div>
                </div>

                {/* 고객 목록 */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">등록된 고객</h3>
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      {searchQuery ? "검색 결과가 없습니다." : "등록된 고객이 없습니다."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900">{customer.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{customer.phone}</p>
                              {customer.birthDate && <p className="text-xs text-slate-400">생년월일: {customer.birthDate}</p>}
                              <p className="text-xs text-slate-500 mt-1">
                                비밀번호: <span className="font-mono font-semibold text-indigo-600">{customer.password || "없음"}</span>
                              </p>
                              <p className="text-xs text-slate-400 mt-1 truncate">서류: {customer.requiredDocuments?.join(", ") || "없음"}</p>
                            </div>
                            <div className="flex gap-1.5 ml-4 shrink-0">
                              <button onClick={() => handleEditCustomer(customer)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors">
                                편집
                              </button>
                              <a href={`tel:${customer.phone}`} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors">
                                전화
                              </a>
                              <button onClick={() => handleDeleteCustomer(customer.id)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-md transition-colors">
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 편집 모달 */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">고객 정보 편집</h2>
              <button
                onClick={() => { setEditingCustomer(null); setEditForm({ name: "", phone: "", birthDate: "", requiredDocuments: [], password: "" }); setEditCustomDocumentName(""); setRegisterMessage(null); }}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >×</button>
            </div>

            <div className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">이름 <span className="text-rose-500">*</span></label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">전화번호 <span className="text-rose-500">*</span></label>
                  <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">비밀번호 (6자리)</label>
                <input
                  type="text"
                  value={editForm.password}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setEditForm({ ...editForm, password: v }); }}
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono tracking-widest"
                  placeholder="000000"
                />
                <p className="text-xs text-slate-400 mt-1">비워두면 기존 비밀번호가 유지됩니다.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">필요한 서류 <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {documentTypes.map((docType) => (
                    <label key={docType} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all text-sm ${
                      editForm.requiredDocuments.includes(docType) ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                    }`}>
                      <input type="checkbox" checked={editForm.requiredDocuments.includes(docType)} onChange={() => handleEditDocumentCheckbox(docType)} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-slate-700">{docType}</span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">서류 직접 추가</label>
                  <div className="flex gap-2">
                    <input type="text" value={editCustomDocumentName} onChange={(e) => setEditCustomDocumentName(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAddEditCustomDocument()} placeholder="예: 건강보험증, 통장사본" className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    <button type="button" onClick={handleAddEditCustomDocument} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">추가</button>
                  </div>
                </div>

                {editForm.requiredDocuments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {editForm.requiredDocuments.map((docType) => (
                      <span key={docType} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-xs font-medium text-indigo-800">
                        {docType}
                        <button type="button" onClick={() => handleRemoveEditDocument(docType)} className="text-indigo-400 hover:text-rose-600 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {registerMessage && (
                <div className={`p-3 rounded-lg text-sm ${registerMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                  {registerMessage.text}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setEditingCustomer(null); setEditForm({ name: "", phone: "", birthDate: "", requiredDocuments: [], password: "" }); setEditCustomDocumentName(""); setRegisterMessage(null); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150 text-sm"
                >취소</button>
                <button onClick={handleUpdateCustomer} disabled={updating} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-50 text-sm">
                  {updating ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
