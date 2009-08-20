class TLogger < Logger
  attr_reader :logger
  def initialize(file, stdout, verbose=false)
    @logger = Logger.new(file, 10, 1024000) # 10 log fajlova po 1.024,000 byteova
    @logger.level = Logger::DEBUG
	  @logger.datetime_format = "%Y-%m-%d %H:%M:%S"    
    @verbose = verbose
    @stdout = stdout
  end

  def debug(str)
    log(str, :debug)
  end
  
  def info(str)
    log(str, :info)
  end
  
  def fatal(str)
    log(str, :fatal)
  end

  def log(str, lvl=:info)
    @logger.send(lvl, str)
    if lvl == :fatal
      raise str
    elsif (@verbose or !(lvl == :info))
      @stdout.puts(str) if (@verbose or !(lvl == :info))
    end
  end
end # of Class TLogger 
