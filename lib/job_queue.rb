class JobQueue < Array
  attr_accessor :all_jobs, :assignments, :done_jobs
  
  def initialize
    super
    @assignments, @done_jobs, @all_jobs = {}, [], []
  end
  
  def start
    all_jobs = self.clone
  end
  
  def assign(job)
    assignments[job] = self.pop
  end
  
  def has_jobs?
    self.size > 0
  end  
  
  def finish(job)
    assignments.delete(job) #] = nil
    done_jobs << job
#    job.finish
  end
  
  def jobs_done
    done_jobs
  end
  
  def jobs_in_progress
    assignments
  end
  
  def jobs_waiting
    self
  end
end
