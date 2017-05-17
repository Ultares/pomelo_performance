# -*-coding:utf-8 -*-
import sys
import json
from collections import OrderedDict
from pyexcel_xls import save_data


def main():
    print 'sys.argv[1]:%s' % sys.argv[1]
    print 'sys.argv[2]:%s' % sys.argv[2]
    print json.loads(sys.argv[2])
    fn = sys.argv[1]
    data = OrderedDict()
    data.update(json.dumps(sys.argv[2]))
    save_data(fn, data)

main()
#print sys.argv