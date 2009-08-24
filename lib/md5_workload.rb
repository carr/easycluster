require "tokyocabinet"

class Md5Workload
  include TokyoCabinet

  attr_accessor :job_name

  def initialize
    @job_name = 'md5crack'

    open_bdb
    @word_size = 3
    @digits_count = 64
    @variations = @digits_count ** @word_size

    @range_min, @range_max = 0, 1000
  end

  def open_bdb
    @bdb = BDB::new

    if !@bdb.open("casket.tcb", BDB::OCREAT) #BDB::OWRITER |
      ecode = @bdb.ecode
      STDERR.printf("open error: %s\n", @bdb.errmsg(ecode))
    end
  end

  def has_jobs_waiting?
    jobs_waiting.size > 0
  end

  def jobs_waiting
    qry = TDBQRY::new(@bdb)
    qry.addcond("finished", TDBQRY::QCNUMEQ, "0")
    res = qry.search
#    res.each do |rkey|
#      rcols = @bdb.get(rkey)
#      printf("name:%s\n", rcols["job_assignment"])
#    end
  end

  def is_finished?
    @range_min > @variations
  end

  def close
    if !@bdb.close
      ecode = @bdb.ecode
      STDERR.printf("close error: %s\n", @bdb.errmsg(ecode))
    end
  end
end

