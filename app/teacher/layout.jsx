import TeacherTopbar from "@/components/teacher/Topbar";
import TeacherSidebar from "@/components/teacher/Sidebar";

export default function TeacherLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <TeacherSidebar />

      <div className="flex-1">
        <TeacherTopbar />
        <main className="p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
