import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Course } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LogOut, BookOpen, Clock, GraduationCap, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import HtmlContent from '@/components/HtmlContent';

// Modal UI (simple shadcn-style)
const Modal = ({ open, onClose, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-md">
        {children}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Change Password Modal
  const [openChangePass, setOpenChangePass] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const enrolledCourses = await api.getEnrolledCourses();
      setCourses(enrolledCourses);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  // =============================
  // CHANGE PASSWORD FUNCTION
  // =============================
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirm) {
      toast.error("All fields are required.");
      return;
    }

    if (newPassword !== confirm) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setLoadingPass(true);
      await api.changePassword(oldPassword, newPassword);
      toast.success("Password changed successfully!");
      setOpenChangePass(false);
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ================= HEADER ================= */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-primary" />
                <GraduationCap className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CCGD Learning Platform</h1>
                <p className="text-xs text-muted-foreground">College of Career Guidance and Development</p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              {/* CHANGE PASSWORD BUTTON */}
              <Button
                variant="outline"
                onClick={() => setOpenChangePass(true)}
              >
                <KeyRound className="h-4 w-4 mr-2" /> Change Password
              </Button>

              {/* LOGOUT */}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="text-muted-foreground">
            Continue your learning journey with your enrolled courses
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Courses Yet</CardTitle>
              <CardDescription>
                You haven't been enrolled in any courses yet.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group p-0 overflow-hidden relative"
                onClick={() => handleCourseClick(course.id)}
                style={course.thumbnail ? {
                  backgroundImage: `url(${course.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '220px',
                  color: '#fff',
                  backgroundColor: 'transparent',
                } : { backgroundColor: 'transparent' }}
              >
                {/* Overlay for better text visibility */}
                {course.thumbnail && (
                  <div
                    className="absolute inset-0 bg-black/50 z-0"
                    aria-hidden="true"
                  />
                )}
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div>
                    <CardTitle className="group-hover:text-indigo-300 transition-colors text-lg font-bold mb-2">
                      {course.fullname || 'Untitled Course'}
                    </CardTitle>
                    <div className="text-sm mb-4 line-clamp-3 bg-transparent">
                      <HtmlContent className="text-foreground" html={course.summary || 'No summary available.'} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground italic">
            "One Purpose, One Mission, One Dream"
          </p>
        </div>
      </main>

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      <Modal open={openChangePass} onClose={() => setOpenChangePass(false)}>
        <h2 className="text-lg font-bold mb-4">Change Password</h2>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <Button onClick={handleChangePassword} disabled={loadingPass} className="w-full">
            {loadingPass ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
