class ChangeContentDefaultInSlideshows < ActiveRecord::Migration
  def self.up
    change_column(:slideshows, :content, :text, :limit => 5.megabytes)
  end

  def self.down
    change_column(:slideshows, :content, :text)
  end
end
