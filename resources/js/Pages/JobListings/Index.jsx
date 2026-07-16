import { withLayout } from '@/utils/withLayout';
import SelectDropdown from '@/Components/SelectDropdown';
import { Briefcase, SlidersHorizontal } from 'lucide-react';
import JobMatchCard from '../../Components/JobMatchCard';

const Index = () => {
  return (
    <>
          <div className="bg-white border border-outline-variant rounded-md p-3 mb-stack-lg w-full">
              <div className="flex items-center gap-stack-sm flex-wrap">
                  <SlidersHorizontal size={18} className="text-body ml-1 hidden sm:block" />

                  <SelectDropdown
                      label="Skill"
                      name="skill"
                      options={[
                          { value: "react", label: "React" },
                          { value: "node", label: "Node.js" },
                          { value: "python", label: "Python" },
                      ]}
                      className="flex-1 min-w-[45%] sm:min-w-[140px] sm:flex-none"
                  />
                  <SelectDropdown
                      label="Lokasi"
                      name="lokasi"
                      options={[
                          { value: "jakarta", label: "Jakarta" },
                          { value: "bandung", label: "Bandung" },
                          { value: "remote", label: "Remote" },
                      ]}
                      className="flex-1 min-w-[45%] sm:min-w-[140px] sm:flex-none"
                  />
                  <SelectDropdown
                      label="Level"
                      name="level"
                      options={[
                          { value: "junior", label: "Junior" },
                          { value: "senior", label: "Senior" },
                      ]}
                      className="flex-1 min-w-[45%] sm:min-w-[140px] sm:flex-none"
                  />
                  <SelectDropdown
                      label="Rentang Gaji"
                      name="gaji"
                      options={[
                          { value: "5-10", label: "5-10 Juta" },
                          { value: "10-20", label: "10-20 Juta" },
                      ]}
                      className="flex-1 min-w-[45%] sm:min-w-[140px] sm:flex-none"
                  />

                  <button className="label text-primary hover:text-primary-container px-3 py-1.5 transition-colors shrink-0 w-full text-right sm:w-auto sm:ml-auto">
                      Clear All
                  </button>
              </div>
          </div>

          <div className='flex flex-col gap-stack-md w-full'>
              <JobMatchCard
                  icon={Briefcase}
                  title="Senior Backend Engineer"
                  company="GoTo"
                  location="Jakarta"
                  workType="Remote"
                  salaryRange="Rp 25-35jt"
                  matchScore={95}
                  matchReason="Cocok kuat: skill Go & Microservices sangat sesuai requirement."
              />

              <JobMatchCard
                  icon={Briefcase}
                  title="Senior Backend Engineer"
                  company="GoTo"
                  location="Jakarta"
                  workType="Remote"
                  salaryRange="Rp 25-35jt"
                  matchScore={95}
                  matchReason="Cocok kuat: skill Go & Microservices sangat sesuai requirement."
              />
          </div>
    </>
   
  )
}

export default withLayout(Index)