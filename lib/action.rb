class Action
  @@work = nil
  
  def self.go(session, request, params)
    if work.has_jobs_waiting?
      map(session, request, params)
    else
      if work.is_finished?
        done
      else
        done
      end
    end
  end
  
  def self.get_file_data(filename, options = {})
    options[:type] ||= :binary
    
    case options[:type]
      when :binary      
        bytes = File.open(filename, "rb").read
        Array.new.tap do |memo|
          bytes.each_byte{|elem| memo << elem.to_i}
        end
    end
  end
  
  def self.map(session, request, params)
    client = work.find_or_initialize_client(params[:user], request, params)
    
    job_assignments = work.assign_package(client)
  
    {
      :jobs_left => work.jobs_waiting.size,      
      :phase => 'map',
      :jobs =>  Array.new.tap do |json|
                  job_assignments.each do |job_assignment|
                    json << {
                      :filename => job_assignment.job.filename,
                      :data => get_file_data(job_assignment.job.filename)
                    }
                  end
                end 
    }
  end
  
  def self.finish_jobs(params, session, request)
    client = work.find_client(params[:user], request) #, params)
        
    # TODO kako je ovo lose iteriranje da je to strasno, smislit nesto bolje
    if params['filename']
      params['filename'].size.times do |index| #.each_with_index do |filename, index|
        work.finish_job params['filename'][index.to_s], client, params['result'][index.to_s], params['processing_time'][index.to_s].to_i
      end     
    end
    
    if work.is_finished?
      work.finalize
    end        
  end
  
  def self.reduce
    
  end
  
  def self.done
    
  end
  
  def self.start
    if @@work.nil?
      puts "Initialized workload"
      #@@work = Workload.new('compress/job.xls') 
      DRb.start_service
      @@work = DRbObject.new nil, 'druby://:9000'
    end
  end
  
  def self.restart
    @@work = nil
    start
  end
  
  def self.work
    @@work
  end
end
