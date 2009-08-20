require "lib/finders"
require "lib/stats"
require "andand"

# = Opis
# klasa predstavlja jedan zadatak koji je potrebno obaviti raspodijeljeno
# == Popis nekih gluposti
# * ovo je lista
# * ovo isto
#
# == Podnaslov
#   Workload.new('job.xls')
class Workload
  include Finders
  include Stats
  
  # kolicina poslova u jednom paketu koji se salje klijentu
  DEFAULT_JOBS_PER_PACKAGE = 1
  
  # Velicina u byteovima jednog posla
  DEFAULT_JOB_SIZE = 5000
  
  # vrijeme nakon kojega se timeouta task
  DEFAULT_JOB_TIMEOUT = 30 # 1min
    
  attr_accessor   :all_jobs,
                  :jobs_waiting,
                  :job_assignments_finished,
                  :job_assignments,
                  :job_folder,
                  :job_name,
                  :time_started,
                  :time_finished,
                  :job_size,
                  :jobs_per_package,
                  :clients,
                  :job_timeout,
                  :jobs_timed_out_count,
                  :finalized

  def initialize(job_folder_or_list_of_filenames, options = {})
    @all_jobs = []   
    @jobs_waiting = []
    @job_assignments_finished = []
    @clients = []
    @job_assignments = []
    @job_size = options[:job_size] || DEFAULT_JOB_SIZE
    @jobs_per_package = options[:jobs_per_package] || DEFAULT_JOBS_PER_PACKAGE
    @job_timeout = options[:job_timeout] || DEFAULT_JOB_TIMEOUT
    @jobs_timed_out_count = 0
    @finalized = false
  
    $log = TLogger.new(File.join('log', "compress.log"), STDOUT, true)
    
    if job_folder_or_list_of_filenames.kind_of? Array
      options[:job_name] ||= 'compress'
      job_folder_or_list_of_filenames.each do |filename|
        add_job filename
      end
      @job_name = options[:job_name]
    else
      raise "File doesn't exists '#{job_folder_or_list_of_filenames}'" unless File.exists?(job_folder_or_list_of_filenames)
      
      if File.directory?(job_folder_or_list_of_filenames)
        @job_folder = job_folder_or_list_of_filenames
      else        
        @job_folder = split_file_into_jobs(job_folder_or_list_of_filenames)
      end      

      @job_name = File.dirname(@job_folder)
      @result_filename = job_folder_or_list_of_filenames.gsub(/job/, "result")
      @root = File.dirname(@job_folder)
      @results_folder = @job_folder.gsub(/jobs/, "results")
      add_jobs_from_folder(@job_folder)
    end
  end
  
  def split_file_into_jobs(file, options = {})
    options[:size] = @job_size
    options[:directory] = File.join(File.dirname(file), "jobs")
    options[:results_directory] = File.join(File.dirname(file), "results")    
    
    `rm -fr #{options[:directory]}/*` # TODO zamijenit ruby kodom
    `rm -fr #{options[:results_directory]}/*` # TODO zamijentit ruby kodom
    `split -a 10 --bytes=#{@job_size} #{file} #{options[:directory]}/`
    
    options[:directory]
  end
  
  def merge_results(options = {})
    return if @result_filename.nil?
    return if Dir["#{@results_folder}/*"].size==0
    `cat #{@results_folder}/* > #{@result_filename}`
  end
  
  def add_jobs_from_folder(job_folder)
    Dir[File.join(job_folder, "*")].sort.each do |filename|
      add_job(filename)  
    end
  end
  
  def add_job(filename)
    job = MapJob.new(filename)
    @all_jobs << job
    @jobs_waiting << job    
  end
  
  def is_finished?
    @jobs_waiting.size==0 and @job_assignments.size==0
  end
  
  def assign_package(client, options = {})
    options[:size] ||= @jobs_per_package
    
    Array.new.tap do |package|
      count = 0
      options[:size].times do
        count+=1
        job_assignment = assign_job(client)
        # ako vise nemamo poslova
        break if job_assignment.nil?
  
        package << job_assignment
      end    
      $log.info "Assigning package size #{count} to '#{client.name}', jobs left #{@jobs_waiting.size}"      
    end
  end  
  
  def assign_job(client)
    @time_started = Time.now if @time_started.nil?
        
    return nil if @jobs_waiting.size==0
    reset_hanging_jobs
    
    job = @jobs_waiting.pop
    
    job_assignment = JobAssignment.new(job, client)
    job_assignment.timeout = @job_timeout
    @job_assignments.push job_assignment        
    job_assignment
  end  
  
  def finish_job(id_or_job, client, value, processing_time)
    id_or_job = id_or_job.filename if id_or_job.kind_of? MapJob
    matching_assignments = find_assignments(id_or_job, client)            
    
    if matching_assignments.size != 1
      puts "Sranje, size je #{matching_assignments.size}"
      return
    end
    
    matching_assignment = matching_assignments.first                
    
    @job_assignments_finished.push matching_assignment
    matching_assignment.finish(value, processing_time)
    @job_assignments.delete matching_assignment
  end
  
  def reset_hanging_jobs
    hanging_jobs_count = 0
    
    job_assignments.each do |job_assignment|
      if job_assignment.has_timed_out?
        job = job_assignment.job
        jobs_waiting.push job
        job_assignments.delete job_assignment
        hanging_jobs_count += 1
      end
    end
    
    @jobs_timed_out_count += hanging_jobs_count
    
    hanging_jobs_count > 0
  end
  
  def has_jobs_waiting?
    @jobs_waiting.size > 0
  end 
  
  # TODO spec za ovo
  def finalize
    return if @finalized
    raise "Work not finished!" unless is_finished?
    merge_results
    @time_finished = Time.now
    generate_stats
    @finalized = true
  end
  
  def duration
    (@time_finished - @time_started) * 1000
  end
  
  def jobs_in_process # TODO maknut metodu, rinejmat varijablu, nesto
    @job_assignments
  end
end
