"use client";

import { useState, useEffect } from "react";

interface Submission {
  name: string;
  phone: string;
  // 간단한 형식 (새로운)
  totalDebt?: string;
  debtIncrease?: string;
  monthlyIncome?: string;
  seizureStatus?: string;
  assets?: string;
  creditors?: string;
  dependents?: string;
  // 기존 필드 (하위 호환성)
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
  
  // 고객 등록 폼 상태
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

  // 서버 사이드 인증
  const handleLogin = async () => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include", // 쿠키 포함
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
      const response = await fetch("/api/admin/submissions", {
        credentials: "include", // 쿠키 포함
      });
      
      if (response.status === 401) {
        setAuthenticated(false);
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        return;
      }
      
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
      const response = await fetch("/api/documents", {
        credentials: "include", // 쿠키 포함
      });
      
      if (response.status === 401) {
        setAuthenticated(false);
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        return;
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers", {
        credentials: "include", // 쿠키 포함
      });
      
      if (response.status === 401) {
        setAuthenticated(false);
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        return;
      }
      
      if (!response.ok) {
        console.error("Failed to fetch customers:", response.status, response.statusText);
        setCustomers([]); // 에러 시 빈 배열로 설정
        return;
      }
      
      const data = await response.json();
      // 배열인지 확인
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.error("Invalid data format:", data);
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]); // 에러 시 빈 배열로 설정
    }
  };

  useEffect(() => {
    if (authenticated) {
      if (activeTab === "documents") {
        fetchDocuments();
      } else if (activeTab === "register") {
        fetchCustomers();
      }
    }
  }, [authenticated, activeTab]);

  const documentTypes = [
    "신분증",
    "소득증명서",
    "부채증명서",
    "자산증명서",
    "은행거래내역",
    "기타",
  ];

  const handleDocumentCheckbox = (docType: string) => {
    setCustomerForm((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.includes(docType)
        ? prev.requiredDocuments.filter((d) => d !== docType)
        : [...prev.requiredDocuments, docType],
    }));
  };

  const handleAddCustomDocument = () => {
    if (!customDocumentName.trim()) {
      setRegisterMessage({ type: "error", text: "서류 이름을 입력해주세요." });
      return;
    }

    if (customerForm.requiredDocuments.includes(customDocumentName.trim())) {
      setRegisterMessage({ type: "error", text: "이미 추가된 서류입니다." });
      return;
    }

    setCustomerForm((prev) => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, customDocumentName.trim()],
    }));
    setCustomDocumentName("");
    setRegisterMessage(null);
  };

  const handleRemoveDocument = (docType: string) => {
    setCustomerForm((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((d) => d !== docType),
    }));
  };

  const handleRegisterCustomer = async () => {
    if (!customerForm.name || !customerForm.phone) {
      setRegisterMessage({ type: "error", text: "이름과 전화번호를 입력해주세요." });
      return;
    }

    if (customerForm.requiredDocuments.length === 0) {
      setRegisterMessage({ type: "error", text: "최소 하나 이상의 서류를 선택해주세요." });
      return;
    }

    setRegistering(true);
    setRegisterMessage(null);
    setSmsSent(false);

    try {
      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerForm),
        credentials: "include", // 쿠키 포함
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterMessage({ type: "success", text: "고객이 성공적으로 등록되었습니다." });
        setGeneratedPassword(data.customer.password);
        setCustomerForm({ name: "", phone: "", birthDate: "", requiredDocuments: [] });
        setCustomDocumentName("");
        fetchCustomers();
      } else {
        setRegisterMessage({ type: "error", text: data.error || "고객 등록 중 오류가 발생했습니다." });
      }
    } catch (error) {
      console.error("Error registering customer:", error);
      setRegisterMessage({ type: "error", text: "고객 등록 중 오류가 발생했습니다." });
    } finally {
      setRegistering(false);
    }
  };

  const handleSendSMS = async () => {
    if (!customerForm.phone || !generatedPassword) {
      setRegisterMessage({ type: "error", text: "고객을 먼저 등록해주세요." });
      return;
    }

    try {
      const siteUrl = window.location.origin;
      const response = await fetch("/api/admin/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customerForm.phone,
          name: customerForm.name,
          password: generatedPassword,
          requiredDocuments: customerForm.requiredDocuments,
          siteUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSmsSent(true);
        setRegisterMessage({ type: "success", text: "문자 메시지가 발송되었습니다." });
        
        // 개발용: 콘솔에 메시지 내용 출력
        if (data.simulatedMessage) {
          console.log("발송된 메시지 내용:", data.simulatedMessage);
        }
      } else {
        setRegisterMessage({ type: "error", text: data.error || "문자 발송 중 오류가 발생했습니다." });
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      setRegisterMessage({ type: "error", text: "문자 발송 중 오류가 발생했습니다." });
    }
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      birthDate: customer.birthDate,
      requiredDocuments: customer.requiredDocuments || [],
      password: customer.password || "",
    });
    setEditCustomDocumentName("");
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    if (!editForm.name || !editForm.phone || editForm.requiredDocuments.length === 0) {
      setRegisterMessage({ type: "error", text: "이름, 전화번호, 그리고 필요한 서류를 선택해주세요." });
      return;
    }

    setUpdating(true);
    setRegisterMessage(null);

    try {
      const response = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 쿠키 포함
        body: JSON.stringify({
          id: editingCustomer.id,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterMessage({ type: "success", text: "고객 정보가 성공적으로 업데이트되었습니다." });
        setEditingCustomer(null);
        fetchCustomers();
      } else {
        setRegisterMessage({ type: "error", text: data.error || "고객 정보 업데이트 중 오류가 발생했습니다." });
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      setRegisterMessage({ type: "error", text: "고객 정보 업데이트 중 오류가 발생했습니다." });
    } finally {
      setUpdating(false);
    }
  };

  const handleEditDocumentCheckbox = (docType: string) => {
    setEditForm((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.includes(docType)
        ? prev.requiredDocuments.filter((d) => d !== docType)
        : [...prev.requiredDocuments, docType],
    }));
  };

  const handleAddEditCustomDocument = () => {
    if (!editCustomDocumentName.trim()) {
      setRegisterMessage({ type: "error", text: "서류 이름을 입력해주세요." });
      return;
    }

    if (editForm.requiredDocuments.includes(editCustomDocumentName.trim())) {
      setRegisterMessage({ type: "error", text: "이미 추가된 서류입니다." });
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, editCustomDocumentName.trim()],
    }));
    setEditCustomDocumentName("");
    setRegisterMessage(null);
  };

  const handleRemoveEditDocument = (docType: string) => {
    setEditForm((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((d) => d !== docType),
    }));
  };

  const formatCurrency = (amount: number) => {
    const eok = Math.floor(amount / 10000);
    const man = amount % 10000;
    if (eok > 0) {
      return man > 0 ? `${eok}억 ${man}만원` : `${eok}억원`;
    }
    return `${man}만원`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
  };

  // 진단내역 삭제
  const handleDeleteSubmission = async (index: number) => {
    if (!confirm("정말로 이 진단내역을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/submissions?index=${index}`, {
        method: "DELETE",
        credentials: "include", // 쿠키 포함
      });

      if (response.ok) {
        fetchSubmissions();
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 고객 삭제
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("정말로 이 고객을 삭제하시겠습니까? 관련 서류도 함께 삭제됩니다.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/customers?id=${id}`, {
        method: "DELETE",
        credentials: "include", // 쿠키 포함
      });

      if (response.ok) {
        fetchCustomers();
        fetchDocuments(); // 서류 목록도 새로고침
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 고객서류 삭제
  const handleDeleteDocument = async (documentId: string, phone: string) => {
    if (!confirm("정말로 이 서류를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/delete?id=${documentId}&phone=${phone}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDocuments();
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 진단내역에서 고객 등록
  const handleRegisterFromSubmission = (submission: Submission) => {
    setCustomerForm({
      name: submission.name,
      phone: submission.phone,
      birthDate: "",
      requiredDocuments: [],
    });
    setActiveTab("register");
    // 고객 등록 탭으로 스크롤
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  // 검색 필터링
  const filteredSubmissions = submissions.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDocuments = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            관리자 로그인
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              로그인
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              관리자 대시보드
            </h1>
            <button
              onClick={() => {
                setAuthenticated(false);
                setPassword("");
              }}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              로그아웃
            </button>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => {
                setActiveTab("submissions");
                setSearchQuery("");
                fetchSubmissions();
              }}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "submissions"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              진단 내역
            </button>
            <button
              onClick={() => {
                setActiveTab("documents");
                setSearchQuery("");
                fetchDocuments();
              }}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "documents"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              고객 서류
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setSearchQuery("");
                fetchCustomers();
              }}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "register"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              고객 등록
            </button>
          </div>

          {activeTab === "submissions" && (
            <>
              <div className="mb-6 flex gap-4">
                <input
                  type="text"
                  placeholder="고객 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? "검색 결과가 없습니다." : "아직 제출된 진단이 없습니다."}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSubmissions.map((submission, index) => {
                const originalIndex = submissions.findIndex((s) => s === submission);
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {submission.name}{submission.age ? ` (${submission.age}세)` : ""}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        연락처: {submission.phone}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        제출일시: {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        submission.result.eligible
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {submission.result.eligible ? "가능" : "제한"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        재무 정보
                      </h3>
                      {submission.totalDebt && typeof submission.totalDebt === "string" ? (
                        // 간단한 형식 (새로운)
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>
                            총 채무 규모: {
                              submission.totalDebt === "over100m" ? "1억 이상" :
                              submission.totalDebt === "7k-100m" ? "7천~1억" :
                              submission.totalDebt === "3k-7k" ? "3천~7천" : "3천 미만"
                            }
                          </li>
                          <li>
                            최근 1년 채무 증가: {
                              submission.debtIncrease === "over3k" ? "3천 이상" :
                              submission.debtIncrease === "1k-3k" ? "1천~3천" :
                              submission.debtIncrease === "under1k" ? "1천 미만" : "없음"
                            }
                          </li>
                          <li>
                            월 실수령 소득: {
                              submission.monthlyIncome === "over300" ? "300 이상" :
                              submission.monthlyIncome === "200-300" ? "200~300" :
                              submission.monthlyIncome === "150-200" ? "150~200" : "150 미만"
                            }만원
                          </li>
                          <li>
                            압류·독촉 상태: {
                              submission.seizureStatus === "salary" ? "급여 압류" :
                              submission.seizureStatus === "account" ? "통장 압류" :
                              submission.seizureStatus === "collection" ? "독촉만" : "없음"
                            }
                          </li>
                          <li>
                            재산 규모: {
                              submission.assets === "over100m" ? "1억 이상" :
                              submission.assets === "3k-100m" ? "3천~1억" :
                              submission.assets === "under3k" ? "3천 미만" : "없음"
                            }
                          </li>
                          <li>
                            채권자 수: {
                              submission.creditors === "over8" ? "8곳 이상" :
                              submission.creditors === "4-7" ? "4~7곳" : "1~3곳"
                            }
                          </li>
                          <li>
                            부양가족 수: {
                              submission.dependents === "over3" ? "3명 이상" :
                              submission.dependents === "2" ? "2명" :
                              submission.dependents === "1" ? "1명" : "없음"
                            }
                          </li>
                        </ul>
                      ) : submission.totalDebtNum !== undefined ? (
                        // 기존 형식 (숫자)
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>총 부채: {formatCurrency(submission.totalDebtNum)}</li>
                          <li>월 소득: {submission.monthlyIncomeNum}만원</li>
                          <li>월 지출: {submission.monthlyExpense}만원</li>
                          <li>자산: {formatCurrency(submission.assetsNum || 0)}</li>
                        </ul>
                      ) : (
                        // 상세 형식 (이전)
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>
                            총 채권액: {formatCurrency(
                              (submission.realEstateDebt || 0) +
                              (submission.carDebt || 0) +
                              (submission.unsecuredDebtPrincipal || 0) +
                              (submission.unsecuredDebtInterest || 0)
                            )}
                          </li>
                          <li>
                            담보부 채권: {formatCurrency(
                              (submission.realEstateDebt || 0) + (submission.carDebt || 0)
                            )}
                          </li>
                          <li>
                            담보부 채권: {formatCurrency(
                              (submission.unsecuredDebtPrincipal || 0) +
                              (submission.unsecuredDebtInterest || 0)
                            )}
                          </li>
                          <li>
                            총 재산액: {formatCurrency(
                              (submission.depositInsurance || 0) +
                              (submission.carMotorcycle || 0) +
                              (submission.deposit || 0) +
                              (submission.realEstate || 0) +
                              (submission.businessEquipment || 0) +
                              (submission.expectedSeverance || 0) +
                              (submission.attachmentDeposit || 0) +
                              (submission.otherAssets || 0)
                            )}
                          </li>
                          <li>월 순수입: {submission.monthlyNetIncome || 0}만원</li>
                          <li>부양가족수: {submission.dependentsNum || 0}명</li>
                          <li>
                            장래 수입가능성: {submission.hasFutureIncome === null 
                              ? "미입력" 
                              : submission.hasFutureIncome 
                              ? "있음" 
                              : "없음"}
                          </li>
                        </ul>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        기타 정보
                      </h3>
                      {submission.employmentStatus ? (
                        // 기존 형식
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>
                            고용 상태:{" "}
                            {
                              {
                                employed: "정규직",
                                contract: "계약직",
                                "self-employed": "자영업",
                                unemployed: "무직",
                                retired: "은퇴",
                              }[submission.employmentStatus] || submission.employmentStatus
                            }
                          </li>
                          <li>
                            부채 유형: {submission.debtType?.join(", ") || "없음"}
                          </li>
                        </ul>
                      ) : (
                        // 새로운 형식
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>
                            부동산 근저당권: {submission.realEstateMortgage === null 
                              ? "미입력" 
                              : submission.realEstateMortgage 
                              ? "있음" 
                              : "없음"}
                          </li>
                          <li>
                            자동차 근저당권: {submission.carMortgage === null 
                              ? "미입력" 
                              : submission.carMortgage 
                              ? "있음" 
                              : "없음"}
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>

                  {submission.additionalInfo && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        추가 정보
                      </h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {submission.additionalInfo}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      AI 진단 결과
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">상세 설명:</p>
                        <p className="text-gray-600 whitespace-pre-line bg-blue-50 p-3 rounded-lg mt-1">
                          {submission.result.explanation}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">권장사항:</p>
                        <p className="text-gray-600 whitespace-pre-line bg-green-50 p-3 rounded-lg mt-1">
                          {submission.result.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <button
                      onClick={() => handleRegisterFromSubmission(submission)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      고객 등록
                    </button>
                    <a
                      href={`tel:${submission.phone}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      📞                       전화하기
                    </a>
                    <button
                      onClick={() => handleDeleteSubmission(originalIndex)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
            </>
          )}

          {activeTab === "documents" && (
            <>
              <div className="mb-6 flex gap-4">
                <input
                  type="text"
                  placeholder="고객 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? "검색 결과가 없습니다." : "아직 업로드된 서류가 없습니다."}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 고객별로 그룹화 */}
                  {Object.entries(
                    filteredDocuments.reduce((acc: any, doc) => {
                      const key = `${doc.name}_${doc.phone}`;
                      if (!acc[key]) {
                        acc[key] = { name: doc.name, phone: doc.phone, documents: [] };
                      }
                      acc[key].documents.push(doc);
                      return acc;
                    }, {})
                  ).map(([key, customer]: [string, any]) => (
                    <div
                      key={key}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {customer.name}
                          </h2>
                          <p className="text-gray-600 mt-1">
                            연락처: {customer.phone}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            서류 수: {customer.documents.length}개
                          </p>
                        </div>
                        <a
                          href={`tel:${customer.phone}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                          📞 전화하기
                        </a>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customer.documents.map((doc: Document) => (
                          <div
                            key={doc.id}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                          >
                            <div className="mb-2">
                              <p className="font-semibold text-gray-900">
                                {doc.documentType}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {doc.fileName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(doc.uploadedAt)}
                              </p>
                              {doc.editHistory && doc.editHistory.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-300">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">수정 이력:</p>
                                  {doc.editHistory.map((history, idx) => (
                                    <p key={idx} className="text-xs text-gray-600">
                                      {history.action} - {formatDate(history.modifiedAt)}
                                      {history.previousFileName && (
                                        <span className="ml-1 text-gray-500">
                                          (이전: {history.previousFileName})
                                        </span>
                                      )}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={doc.fileUrl.startsWith("/api/") ? doc.fileUrl : `/api/documents/file?file=${doc.fileUrl.replace("/uploads/", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                              >
                                📄 서류 보기
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(doc.id, doc.phone)}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                              >
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

          {activeTab === "register" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-2">
                  고객 등록 및 서류 요청
                </h2>
                <p className="text-blue-800 text-sm">
                  고객 정보를 등록하고 필요한 서류를 선택한 후, 고객에게 자동으로 문자 메시지를 발송할 수 있습니다.
                </p>
              </div>
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="고객 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  새 고객 등록
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="홍길동"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>


                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    필요한 서류 <span className="text-red-500">*</span>
                  </label>
                  
                  {/* 기본 서류 목록 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {documentTypes.map((docType) => (
                      <label
                        key={docType}
                        className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={customerForm.requiredDocuments.includes(docType)}
                          onChange={() => handleDocumentCheckbox(docType)}
                          className="mr-2"
                        />
                        <span>{docType}</span>
                      </label>
                    ))}
                  </div>

                  {/* 커스텀 서류 추가 */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      서류 직접 추가
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDocumentName}
                        onChange={(e) => setCustomDocumentName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddCustomDocument()}
                        placeholder="서류 이름을 입력하세요 (예: 건강보험증, 통장사본 등)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomDocument}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        추가
                      </button>
                    </div>
                  </div>

                  {/* 선택된 서류 목록 (기본 + 커스텀) */}
                  {customerForm.requiredDocuments.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        선택된 서류 목록
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {customerForm.requiredDocuments.map((docType) => (
                          <div
                            key={docType}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <span className="text-sm text-blue-900">{docType}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(docType)}
                              className="text-red-600 hover:text-red-800 text-sm font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {registerMessage && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${
                      registerMessage.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {registerMessage.text}
                  </div>
                )}

                {generatedPassword && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>생성된 비밀번호:</strong> {generatedPassword}
                      <br />
                      이 비밀번호가 고객에게 문자로 발송됩니다.
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleRegisterCustomer}
                    disabled={registering}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {registering ? "등록 중..." : "고객 등록"}
                  </button>
                  {generatedPassword && !smsSent && (
                    <button
                      onClick={handleSendSMS}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      📱 문자 발송
                    </button>
                  )}
                </div>
              </div>

              {/* 등록된 고객 목록 */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  등록된 고객 목록
                </h3>
                {customers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    등록된 고객이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        {searchQuery ? "검색 결과가 없습니다." : "등록된 고객이 없습니다."}
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {customer.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                전화번호: {customer.phone}
                              </p>
                              <p className="text-sm text-gray-600">
                                생년월일: {customer.birthDate}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                비밀번호: <span className="font-mono font-semibold text-blue-600">{customer.password || "없음"}</span>
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                필요한 서류: {customer.requiredDocuments?.join(", ") || "없음"}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditCustomer(customer)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
                              >
                                ✏️ 편집
                              </button>
                              <a
                                href={`tel:${customer.phone}`}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                              >
                                📞 전화
                              </a>
                              <button
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 편집 모달 */}
          {editingCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    고객 정보 편집
                  </h2>
                  <button
                    onClick={() => {
                      setEditingCustomer(null);
                      setEditForm({ name: "", phone: "", birthDate: "", requiredDocuments: [], password: "" });
                      setEditCustomDocumentName("");
                      setRegisterMessage(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        전화번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 (4자리)
                    </label>
                    <input
                      type="text"
                      value={editForm.password}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setEditForm({ ...editForm, password: value });
                      }}
                      maxLength={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder="0000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      비밀번호를 변경하지 않으려면 비워두세요. 기존 비밀번호가 유지됩니다.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      필요한 서류 <span className="text-red-500">*</span>
                    </label>
                    
                    {/* 기본 서류 목록 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      {documentTypes.map((docType) => (
                        <label
                          key={docType}
                          className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editForm.requiredDocuments.includes(docType)}
                            onChange={() => handleEditDocumentCheckbox(docType)}
                            className="mr-2"
                          />
                          <span>{docType}</span>
                        </label>
                      ))}
                    </div>

                    {/* 커스텀 서류 추가 */}
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        서류 직접 추가
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editCustomDocumentName}
                          onChange={(e) => setEditCustomDocumentName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddEditCustomDocument()}
                          placeholder="서류 이름을 입력하세요 (예: 건강보험증, 통장사본 등)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleAddEditCustomDocument}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                          추가
                        </button>
                      </div>
                    </div>

                    {/* 선택된 서류 목록 (기본 + 커스텀) */}
                    {editForm.requiredDocuments.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          선택된 서류 목록
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {editForm.requiredDocuments.map((docType) => (
                            <div
                              key={docType}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <span className="text-sm text-blue-900">{docType}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEditDocument(docType)}
                                className="text-red-600 hover:text-red-800 text-sm font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {registerMessage && (
                    <div
                      className={`p-4 rounded-lg ${
                        registerMessage.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {registerMessage.text}
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        setEditingCustomer(null);
                        setEditForm({ name: "", phone: "", birthDate: "", requiredDocuments: [], password: "" });
                        setEditCustomDocumentName("");
                        setRegisterMessage(null);
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleUpdateCustomer}
                      disabled={updating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      {updating ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
