class JobAssignment
  DEFAULT_TIMEOUT = 60 # 1 min
  attr_accessor   :job, :client, :time_started, :time_finished, :client_processing_time, :timeout
  
	def initialize(job, client)
	  @job, @client = job, client
	  @time_started = Time.now
	  @timeout = DEFAULT_TIMEOUT # TODO maknut ovo
	end
	
	def finish(value, client_processing_time)
	  raise "Client processing time must be a number, got #{client_processing_time}" unless client_processing_time.kind_of? Fixnum
	  @job.finish(value)
	  @time_finished = Time.now
	  @client_processing_time = client_processing_time
	end
	
	def has_finished?
	  not time_finished.nil?
  end
	
	def has_timed_out?
	  has_finished? ? false : (Time.now - time_started) > self.timeout
	end
	
	def duration
	  (time_finished - time_started)*1000
  end	  
end
