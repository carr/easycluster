require 'boot'

describe "Workload" do  
  before do
    @w = Workload.new("compress/job.xls")
    @c = Client.new('baba', '127.0.0.1', 'Firefox')
  end
  
  it "should have items" do
    Dir[File.join("compress", "jobs", "*")].should have(@w.all_jobs.size).jobs    
  end
  
  it "should clear results" do
    `echo "baba" > compress/results/baba`
    @w = Workload.new("compress/job.xls")    
    Dir[File.join("compress", "results", "*")].should have(0).files
  end  
  
  it "should manage job lists" do
    @w.jobs_in_process
    in_process, waiting = @w.jobs_in_process.size, @w.jobs_waiting.size
    
    @w.assign_job(@c)
    
    @w.jobs_in_process.should have(in_process+1).jobs
    @w.jobs_waiting.should have(waiting-1).jobs
  end
  
  it "should have a job size" do
    @w.job_size = 100
    @w.job_size.should be 100
  end  
  
  it "should have jobs waiting" do
    @w.has_jobs_waiting?.should be true
  end
  
  it "should finish jobs" do
    id = Dir['compress/jobs/*'].first
    value = "nebitno"
    processing_time = 3322
    
    @w = Workload.new [id]
    @w.assign_job(@c)        
    @w.finish_job(id, @c, value, processing_time)
    
    @w.all_jobs[0].is_finished?.should be true
    @w.is_finished?.should be true
    @w.job_assignments_finished.should have(1).job
  end  
 
  it "should reset hanging jobs" do
    id = Dir['compress/jobs/*'].first

    @w = Workload.new [id], {:job_timeout => 0.1}
    @w.assign_job(@c)    
    sleep(0.12)

    @w.reset_hanging_jobs.should be true 
    @w.jobs_timed_out_count.should be == 1   
    @w.jobs_in_process.should have(0).jobs_in_process
    @w.jobs_waiting.should have(1).jobs_waiting
    @w.all_jobs.should have(1).all_jobs
  end
  
  it "should find a job by name" do
    assigned_job = @w.assign_job(@c).job
    job = @w.find_assignments(assigned_job.filename, @c).first.job
    job.should be assigned_job
  end
  
  it "should not find a job by name (it wasnt assigned)" do
    assignments = @w.find_assignments('compress/ab', @c)
    assignments.should have(0).assignments
  end  
  
  it "should not find a job by name (another client)" do
    assignments = @w.find_assignments('compress/ab', Client.new('pitajboga', '127.0.0.1', 'Firefox'))
    assignments.should have(0).assignments
  end  
  
  it "should not find a job by name (another job)" do
    @w.assign_job(@c)    
    assignments = @w.find_assignments('compress/123213123', @c)
    assignments.should have(0).assignments
  end    
  
  it "should finish all jobs" do
    job_completions = 0
    while not @w.is_finished?
      job_assignment = @w.assign_job(@c)
      if job_assignment   
        job_completions+=1
        @w.finish_job(job_assignment.job, @c, "500;3", 123456789) 
      end
    end
    
    job_completions.should be @w.all_jobs.size
  end
  
#  it "should finish all jobs but with timeouts randomly" do
#    JobAssignment.timeout = 0.1
#    job_completions = 0
#    timeout_count = 0
#    while not @w.is_finished?
#      job_assignment = @w.assign_job(@c)
#      sleep(JobAssignment.timeout*2*rand)

#      if job_assignment
#        if job_assignment.has_timed_out?
#          timeout_count+=1
#        else
#          job_completions+=1
#          @w.finish_job(job_assignment.job, :bla, :bla)           
#        end
#      end
#    end
#    
##    puts "Timeout count #{timeout_count}"    
#    job_completions.should be @w.all_jobs.size    
#    timeout_count.should be > 0
#  end
  
  it "should send stuff in packages" do
    @w.jobs_per_package = 10
    #JobAssignment.timeout = 0.01    
    job_completions = 0
    timeout_count = 0
    package_count = 0
        
    while not @w.is_finished?
      job_assignments = @w.assign_package(@c)
      #sleep(JobAssignment.timeout*2*rand)

      if job_assignments
        package_count += 1
        job_assignments.each do |job_assignment|
        if job_assignment.has_timed_out?
            timeout_count+=1
          else
            job_completions+=1
            @w.finish_job(job_assignment.job, @c, "300;33", 123456)           
          end
        end
      end      
    end    
    
    job_completions.should be @w.all_jobs.size
#    expected_size = 
    package_count.should be((@w.all_jobs.size / @w.jobs_per_package) +1 ) # zasto ovdje ne ide + 1??
  end
  
  it "should accept input filename" do
    @w = Workload.new('compress/job.xls')
  end
  
  it "should split file into jobs" do
    job_size = 1000
    @w = Workload.new('compress/job.xls', :job_size => job_size)
    @w.all_jobs.should have((File.stat('compress/job.xls').size / job_size) + 1).files

    job_size = 10240
    @w = Workload.new('compress/job.xls', :job_size => job_size)
    @w.all_jobs.should have((File.stat('compress/job.xls').size / job_size) + 1).files    
  end
  
  it "should merge results" do 
    @w.merge_results
    if @w.job_assignments_finished.size>0
      File.stat('compress/result.xls').size.should be >0  # zasada
    end
  end
  
  it "should have a job name" do
    @w.job_name.should == "compress"
  end
  
  describe "should manage clients and" do
    before do
      @w = Workload.new("compress/job.xls")
    end
    
    it "should find or initialize clients" do
      request = OpenStruct.new :ip => '127.0.0.1'
      params = {:agent => 'Firefox'}
      @c = @w.find_or_initialize_client('klijent1', request, params)
      @c = @w.find_or_initialize_client('klijent2', request, params)
      @c = @w.find_or_initialize_client('klijent1', request, params)
      @w.clients.should have(2).clients
    end    
    
  
    it "should list finished job assignments for client" do
      @w.jobs_per_package = 3
      @w.assign_package(@c).each{|ja| @w.finish_job(ja.job, @c, '300', 0) }
      assignments = @w.find_finished_assignments_for_client(@c.name)
      assignments.should have(3).assignments
    end    
  end
  
  it "should round correctly" do
    @w.round(3.2222222222, 2).should == 3.22
    @w.round(3.149999999, 1).should == 3.1
    @w.round(3.15, 1).should == 3.2
  end
  
  it "should percentilize correctly" do
    @w.percentilize(1, 3).should == 33.33
  end

  
  # TODO false specke za slučajeve kad je package size veci od fajla i slicno
end
