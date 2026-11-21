import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Stethoscope, Star, Calendar, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import { doctorsAPI } from '../../api/doctors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const DoctorDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [specialization, page]);

  const fetchDepartments = async () => {
    try {
      const res = await doctorsAPI.getDepartments();
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorsAPI.getDoctors({
        search: search.trim(),
        specialization: specialization.trim(),
        page,
        limit: 9,
      });
      setDoctors(res.data.doctors || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">Medical Faculty</span>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Find Verified Doctors
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Browse our verified specialists across clinical departments and book consultations with confidence.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by physician name or keyword..."
            className="w-full pl-11 pr-24 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={specialization}
            onChange={(e) => {
              setSpecialization(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-56 py-2.5 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id || dept.name} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <Loader message="Loading verified physicians..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No verified physicians found"
          description="Try broadening your search term or selecting a different department."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setSpecialization('');
            setPage(1);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <Card
              key={doc.id}
              className="flex flex-col justify-between hover:border-blue-200 hover:shadow-lg transition-all p-6"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={doc.profile_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-gray-100 border border-gray-100 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-gray-900 truncate">{doc.name}</h3>
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" title="Verified Practitioner" />
                    </div>
                    <p className="text-xs font-semibold text-primary mt-0.5">{doc.specialization}</p>
                    <p className="text-[11px] text-gray-500 truncate">{doc.qualifications}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge status="verified" text="Verified" className="text-[10px]" />
                      <span className="text-[11px] text-gray-500 font-medium">
                        {doc.experience_years} yrs exp
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {doc.biography || 'Dedicated physician committed to providing comprehensive clinical care and patient excellence.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block">Consultation Fee</span>
                  <span className="text-base font-bold text-gray-900">${doc.consultation_fee?.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/doctors/${doc.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                  <Link to={`/patient/book-appointment?doctor_id=${doc.id}`}>
                    <Button variant="primary" size="sm">
                      <Calendar className="w-3.5 h-3.5 mr-1" /> Book Slot
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default DoctorDirectory;
