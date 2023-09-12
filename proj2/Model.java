import java.util.ArrayList;

// ****
// (Step 6): In Model, add a class to represent a thing.
class Thing
{
	public int x;
	public int y;
	public int kind;

	Thing(int x, int y, int kind)
	{
		this.x = x;
		this.y = y;
		this.kind = kind;
	}

	// unmarshaling constructor
	Thing(Json ob)
    {
		System.out.println(ob.get("x"));
		this.x = (int) ob.getLong("x");
		//System.out.println(this.x);
		this.y = (int) ob.getLong("y");
		this.kind = (int) ob.getLong("kind");
	}

	public Json marshal() 
	{
		Json thing = Json.newObject();
		thing.add("kind", this.kind);
		thing.add("x", this.x);
		thing.add("y", this.y);
		return thing;
	}
}

class Model
{
	int turtle_x;
	int turtle_y;
	int dest_x;
	int dest_y;
	static int speed = 4;

	public ArrayList<Thing> things;
	int selected_thing; // index


	Model()
	{
		this.turtle_x = 100;
		this.turtle_y = 100;
		this.dest_x = 150;
		this.dest_y = 100;
		this.things = new ArrayList<Thing>();
		this.selected_thing = 0;
	}

	public Json marshal()
	{
		Json map = Json.newObject();
		Json list_of_things = Json.newList();
		map.add("things", list_of_things);
		for (Thing t : this.things)
		{
			list_of_things.add(t.marshal());
		}
		return map;
	}

	public void unmarshal(String str)
	{
		Json ob = Json.parse(str);
		Json thingList = ob.get("things");
		for(int i = 0; i < thingList.size(); i++) {
			System.out.println(thingList.get(i));
			this.things.add(new Thing(thingList.get(i)));
			System.out.println(this.things);
		}
	}

	// find distance between a thing (contains x,y) and given X,Y coords
	public double calculate_distance(Thing thing, int x, int y){
		double dist = Math.sqrt((y - thing.y) * (y - thing.y) + (x - thing.x) * (x - thing.x));
		return dist;
	}

	public void addThing(int x, int y){ // x and y of the mouse
		this.things.add(new Thing(x, y, this.selected_thing));
	}

	public void removeThing(int x, int y){
		// search for thing closest to these points
		double closest_distance = Double.MAX_VALUE;
		int closest_thing = -1;

		for (int i = 0; i < this.things.size(); i++) {
			double distance = calculate_distance(this.things.get(i), x, y);
			if (distance < closest_distance) {
				closest_distance = distance;
				closest_thing = i;
			}
		}

		this.things.remove(closest_thing);
	}

	public void update()
	{
		if(this.turtle_x < this.dest_x)
            this.turtle_x += Math.min(speed, dest_x - turtle_x);
		else if(this.turtle_x > this.dest_x)
            this.turtle_x -= Math.max(speed, dest_x - turtle_x);
		if(this.turtle_y < this.dest_y)
            this.turtle_y += Math.min(speed, dest_y - turtle_y);
		else if(this.turtle_y > this.dest_y)
            this.turtle_y -= Math.max(speed, dest_y - turtle_y);
	}

    public void reset()
    {
        turtle_x = 200;
        turtle_y = 200;
        dest_x = turtle_x;
        dest_y = turtle_y;
    }

	public void setDestination(int x, int y)
	{
		this.dest_x = x;
		this.dest_y = y;
	}
}